console.log("In background");
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === chrome.runtime.OnInstalledReason.INSTALL) {
    // chrome.runtime.setUninstallURL('https://example.com/extension-survey');
    chrome.storage.sync.set({
      autoJoin: true,
      autoEnd: true,
      showQuickMessage: true,
      firstLoad: true,
    });
    chrome.runtime.openOptionsPage(() => {
      console.log("Success");
    });
  }
});
function sendNotification(request) {
  chrome.notifications.create({
    iconUrl: "icon48.png",
    message: request.message ?? "A meeting was closed automatically",
    title: request.title ?? "A meeting ended",
    type: "basic",
  });
}
// @ts-ignore
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  console.log(request);
  if (request.closeTab) {
    sendNotification({ message: "Meeting " + sender.tab.url + " was closed" });
    return chrome.tabs.remove(sender.tab.id);
  }
  if (request.sendNotification) {
    return sendNotification(request);
  }
  // Else create alarm for opening a meeting
  const name = request.subjectName;
  const times = request.daysWithTimes;
  if (!request.disabled) {
    _createAlarm(times, name);
  }
  setTimeout(() => {
    sendResponse({ message: "Done", status: "success" });
  }, 500);
  return true;
});
// @ts-ignore
chrome.alarms.onAlarm.addListener((alarm) => {
  console.log(alarm.name);

  chrome.storage.sync.get(alarm.name, async (subject) => {
    // console.log(subject[alarm.name]);
    if (subject[alarm.name]) {
      // Open the meeting
      const tab = await chrome.tabs.create({
        url: subject[alarm.name].meetUrl,
      });
      // Auto join and quick message script
      chrome.storage.sync.set({
        [subject[alarm.name].meetUrl]: true,
      });
      chrome.runtime.sendMessage({ meetUrl: subject[alarm.name].meetUrl });
      // chrome.scripting.executeScript({
      //   target: { tabId: tab.id },
      //   files: ["meet_script.js"],
      // });
      // create next alarm
      if (!subject[alarm.name].disabled) {
        console.log("Creating next alarm");
        _createAlarm(subject[alarm.name].daysWithTimes, alarm.name);
        _createEndCallAlarm(
          subject[alarm.name].meetUrl,
          subject[alarm.name].duration
        );
      }
    }
  });
  const regex = /end__.+__/gi;
  if (regex.test(alarm.name)) {
    chrome.storage.sync.get("autoEnd", async (data) => {
      const method = data.autoEnd;
      console.log(method);
      const meetUrl = alarm.name.substring(5, alarm.name.length - 2);
      const tabExists = await chrome.tabs.query({
        url: meetUrl,
      });
      tabExists.forEach((tab) => {
        chrome.tabs.sendMessage(tab.id, {
          endMeetMethod: method,
          url: meetUrl,
        });
      });
    });
  }
  // @ts-ignore
  // chrome.tabs.create({ url: "https://meet.google.com/?" + alarm.name });
});
/**
 * Creates the next alarm for a subject.
 * The Alarm is not recurring _by itself_, rather the onAlarm
 * listener should call `_createAlarm` with the subject name
 * in order to create the next alarm for that subject
 * @param {Array<Number>} times Timings on each day, `null` if a day is not selected
 * @param {String} subjectName The subject for which alarm is to be created
 */
function _createAlarm(times, subjectName) {
  /**
   * The most recent (past) midnight (today's midnight)
   */
  const todayMidnight = new Date();
  todayMidnight.setHours(0, 0, 0);
  /**
   * Monday = 0
   * Tuesday = 1 and so on
   */
  const today = todayMidnight.getDay() - 1;
  // The idea is that we set an alarm for the immediate
  // next meeting time available and then set the next alarm when
  // this alarm goes off, instead of having a `periodInMinutes` of 1 week
  //
  // This means that _createAlarm is called in two situations:
  // 1) Initial subject is created
  // 2) An alarm goes off
  //
  // We loop over the `times` array, starting from _today's_ index
  // and wrap over till "yesterday" of next week (Ex. Mon to Sun /or/ Thu to Wed)
  //
  // Problem is that we must look at times after the current time
  // If it is Mon, 5pm right now and a meting time is on Mon 4pm
  // we should set the alarm for the next week's Mon

  /**
   * Ends the loop at the 'yesterday' of next week.
   *
   * If we encouter a time in today which is in the past
   * this `correction` is incremented so that the alarm
   * is created on the 'today' of next week
   * (loop will end after exactly one week).
   */
  let correction = today;
  /**
   * Loop from today till next week to set the next alarm.
   */
  for (let index = today; index <= times.length + correction - 1; index++) {
    const day = index % times.length; //to wrap around
    console.log("Day: ", day);
    // if (index < times.length + correction - 1) break;
    if (times[day] != null) {
      const daysTillFirstAlarm =
        today <= day
          ? today === day && correction > today
            ? 7
            : day - today
          : 7 + day - today; // (7-today) + day
      // if(correction > today) daysTillFirstAlarm = 7;
      const minutesTillFirstAlarmDay = daysTillFirstAlarm * 1440;
      const minutesAfterTodayMidnightTillFirstAlarm =
        minutesTillFirstAlarmDay + times[day];
      const minutesAfterNowTillFirstAlarm =
        minutesAfterTodayMidnightTillFirstAlarm -
        (Date.now() - todayMidnight.getTime()) / 60000;

      console.log("Alarm", subjectName, " in ", minutesAfterNowTillFirstAlarm);
      if (minutesAfterNowTillFirstAlarm <= 0 && correction === today) {
        // Increment correction so that this loop reaches this day
        // the next week
        correction++;
        continue;
      }

      chrome.alarms.create(subjectName, {
        delayInMinutes: minutesAfterNowTillFirstAlarm,
        // Don't periodInMinutes: 10080,
      });
      // chrome.alarms.create("alarm_name", {delayInMinutes: _minutes})
      break;
    } else continue;
  }
}
// listen for end Call Alarm
chrome.alarms.onAlarm.addListener((alarm) => {
  const regex = /end__.+__/gi;
  if (regex.test(alarm.name)) {
    chrome.storage.sync.get("autoEnd", async (data) => {
      const method = data.autoEnd;
      const meetUrl = alarm.name.substring(5, alarm.name.length - 2);
      const tabExists = await chrome.tabs.query({
        url: meetUrl,
      });
      chrome.runtime.sendMessage({
        endMeetMethod: method,
        url: meetUrl,
      });
      return;
      if (method != "off" && tabExists?.length > 0) {
        if (method === "call") {
          console.log("Ending call");
          chrome.runtime.sendMessage({
            endCall: true,
            url: alarm.name.substring(5, alarm.name.length - 2),
          });
        } else {
          console.log("Closing tab");
          // Handle end tab
          try {
            const url = alarm.name.substring(5, alarm.name.length - 2);
            const tab = await chrome.tabs.query({
              url: url,
            });
            //TODO: Send message with endCall = true
            // then sendResponse from content script
            // here where we have remove(sender.tab.id)
            chrome.storage.sync.get(url, (s) => {
              if (s[url]) {
                chrome.tabs.remove(tab[0].id);
              }
            });
            // chrome.runtime.sendMessage({
            //   endCall: alarm.name.substring(5, alarm.name.length - 2),
            // });

            // chrome.tabs.remove(tab[0].id);
          } catch (e) {
            console.log(e);
          }
        }
      }
    });
  }
});
function _createEndCallAlarm(url, duration) {
  if (duration > 0) {
    console.log("Ending in ", duration);
    chrome.alarms.create(`end__${url}__`, {
      delayInMinutes: Number(duration),
    });
  }
}
chrome.runtime.onMessageExternal.addListener(
  function (request, sender, sendResponse) {
    if (request) {
      if (request.fromShare) {
        chrome.storage.sync.get(null, (d) => {
          delete d.autoJoin;
          delete d.showQuickMessage;
          delete d.autoEnd;
          sendResponse(d);
        })
      } else if (request.openOptions) {
        chrome.runtime.openOptionsPage(() => {
        });
      }
      if (request.save) {
        if (request.data) {
          try {
            chrome.storage.sync.set(request.data);
            chrome.alarms.clearAll(() => {
              chrome.storage.sync.get(null, (data) => {
                console.log(data);
                for (const s in data) {
                  console.log(s);
                  if (data[s]?.daysWithTimes)
                    _createAlarm(data[s].daysWithTimes, s);
                }
                // for (let name in Object.keys(data)) {
                //   console.log(data[name]);
                //   if (data[name]?.daysWithTimes)
                //     _createAlarm(data[name].daysWithTimes, name);
                // }
              })
            })
            sendResponse({ saved: true });
          }
          catch (e) {
            sendResponse({ saved: false });
          }
        }
      }
    }
    return true;
  });