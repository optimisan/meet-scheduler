console.log("In background");
chrome.runtime.onInstalled.addListener(() => {
  console.log("ASOinfwef");
});
// @ts-ignore
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  console.log(request);
  const name = request.subjectName;
  const times = request.daysWithTimes;
  _createAlarm(times, name);
  sendResponse({ message: "Done", status: "success" });
});
// @ts-ignore
chrome.alarms.onAlarm.addListener((alarm) => {
  console.log(alarm.name);
  chrome.storage.local.get(alarm.name, (subject) => {
    console.log(subject[alarm.name]);
    if (subject[alarm.name]) {
      chrome.tabs.create({ url: subject[alarm.name].meetUrl });
    }
    // create next alarm
    _createAlarm(subject[alarm.name].daysWithTimes, alarm.name);
  });
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
    if (times[day]) {
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

      console.log("Alarm in ", minutesAfterNowTillFirstAlarm);
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

// chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
//   console.log(request);
// });
