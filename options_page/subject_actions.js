const todayMidnight = new Date();
todayMidnight.setHours(0, 0, 0);
function Subject(subject, name) {
  this.times = subject.daysWithTimes;
  this.name = name;
  this.color = getAColor();
  this.meetUrl = subject.meetUrl;
  this.disabled = `disabled-${subject.disabled}`;
  this.icon = subject.disabled ? "clear" : "check";
  this.duration = subject.duration
    ? `<span class="new badge blue" data-badge-caption="min">${subject.duration}</span>`
    : "";
  this.meetingCode = () => {
    const url = new URL(this.meetUrl);
    if (url.hostname == "meet.google.com") return url.pathname.replace("/", "");
    else return null;
  };
  /**
   * @returns String
   */
  this.getAllTimes = () => {
    let renderedDays = "";
    this.times.forEach((time, day) => {
      // day = day.toString();
      if (time != null) {
        renderedDays += `
        <div class="day-chip-display">${day.dayFromIndex()} ${time.timeToString(
          { short: true }
        )}</div>
        `;
      }
    });
    return renderedDays;
  };

  /**
   * Get the upcoming time to display
   */
  this.upcomingTime = (asString = true) => {
    // same logic as in _createAlarm in background.js

    /**
     * Monday = 0
     * Tuesday = 1 and so on
     */
    const today = todayMidnight.getDay() - 1;
    let correction = today;
    /**
     * Loop from today till next week to set the next alarm.
     */
    for (
      let index = today;
      index <= this.times.length + correction - 1;
      index++
    ) {
      const day = index % this.times.length; //to wrap around
      // if (index < times.length + correction - 1) break;
      if (this.times[day] != null) {
        const daysTillFirstAlarm =
          today <= day
            ? today === day && correction > today
              ? 7
              : day - today
            : 7 + day - today; // (7-today) + day
        // if(correction > today) daysTillFirstAlarm = 7;
        const minutesTillFirstAlarmDay = daysTillFirstAlarm * 1440;
        const minutesAfterTodayMidnightTillFirstAlarm =
          minutesTillFirstAlarmDay + this.times[day];
        const minutesAfterNowTillFirstAlarm =
          minutesAfterTodayMidnightTillFirstAlarm -
          (Date.now() - todayMidnight.getTime()) / 60000;

        // console.log("Alarm in ", minutesAfterNowTillFirstAlarm);

        if (minutesAfterNowTillFirstAlarm <= 0 && correction === today) {
          // Increment correction so that this loop reaches this day
          // the next week
          correction++;
          continue;
        }
        console.log("Minutes ", minutesAfterNowTillFirstAlarm);
        return asString
          ? minutesAfterNowTillFirstAlarm.timeToString({
              fromMidnight: this.times[day],
            })
          : minutesAfterNowTillFirstAlarm;
      } else continue;
    }
  };
}

function initializeDisableSubjects() {
  document.querySelectorAll(".timeline-icon").forEach((ele) => {
    ele.addEventListener("click", () => {
      disableSubject(ele.getAttribute("data-subject-name"));
    });
  });
}
/**
 * Disables a subject
 * Call in an event listener callback
 * @param {string} subjectName
 */
function disableSubject(subjectName) {
  chrome.storage.local.get(subjectName, (data) => {
    const subject = data[subjectName];
    let newSubject = { ...subject, disabled: !subject.disabled };
    chrome.storage.local.set({
      [subjectName]: newSubject,
    });
    chrome.alarms.clear(subjectName);
    chrome.runtime.sendMessage({ ...newSubject, subjectName });
  });
}

Number.prototype.timeToString = function ({ short = false, fromMidnight = 0 }) {
  console.log("Time is ", +this);

  const time = (Date.now() - todayMidnight.getTime()) / 60000 + +this;

  if (time < 60) {
    return short ? `0:${Math.floor(this)}` : `In ${Math.floor(this)} minutes`;
  } else if (+this < 1440 || time < 1440) {
    return short
      ? `${Math.floor(+this / 60)}:${Math.floor(+this % 60)}`
      : `In ${Math.floor(+this / 60)} hours ${Math.floor(+this % 60)} minutes`;
  } else if (time < 2880) {
    // const tom = time - 1440;
    console.log(time);
    return `Tomorrow at ${Math.floor(fromMidnight / 60)}:${Math.floor(
      fromMidnight % 60
    )}`;
  } else {
    // const daysTime = time % 1440;
    return `In ${Math.floor(time / 1440)} days`;
  }
};
