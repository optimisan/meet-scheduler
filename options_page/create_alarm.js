function createAlarm(subject) {
  /** The nearest _past_ midnight
   * (start of today)
   */
  const todayMidnight = new Date();
  todayMidnight.setHours(0, 0, 0);
  /**
   * Monday = 0
   * Tuesday = 1 and so on
   */
  const today = todayMidnight.getDay() - 1;
  const weekMinutes = 10080;
  /// End times
  const name = subject.name;
  const times = subject.daysWithTimes;
  // const url = subject.meetUrl;
  console.log("Sending message");
  chrome.runtime.sendMessage({
    subjectName: name,
    daysWithTimes: times,
  });
  return;
  // times.forEach((time, day) => {
  //   // time is the minutes from midnight after which
  //   // meeting is to be opened
  //   // We add this `time` to the minutes till the closest day
  //   // and set the alarm which repeats weekly for each day

  //   //check if this day was selected
  //   if (time) {
  //     const daysTillFirstAlarm = today <= day ? day - today : 7 + day - today; // (7-today) + day
  //     const minutesTillFirstAlarmDay = daysTillFirstAlarm * 1440;
  //     const minutesAfterTodayMidnightTillFirstAlarm =
  //       minutesTillFirstAlarmDay + time;
  //     const minutesAfterNowTillFirstAlarm =
  //       minutesAfterTodayMidnightTillFirstAlarm -
  //       (Date.now() - todayMidnight) / 60000;

  //     chrome.runtime.sendMessage({
  //       subjectName: name,
  //       delayInMinutes: minutesAfterNowTillFirstAlarm,
  //     });
  //     console.log("Alarm in ", minutesAfterNowTillFirstAlarm);
  //     // chrome.alarms.create("alarm_name", {delayInMinutes: _minutes})
  //   }
  // });
}
