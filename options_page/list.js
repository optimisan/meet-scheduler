document.addEventListener("DOMContentLoaded", () => {
  chrome.storage.local.get(null, (s) => {
    displaySubjects(s);
  });
});

/**
 * Convert daysWithTimes array indices
 * to Day names
 * Note that the for-in loop on line 19
 * iterates over the indices as `Strings`
 * @returns Day of week
 */
String.prototype.dayFromIndex = function () {
  // !!Do not use arrow function
  // otherwise "this" will refer to the
  // global window object !!
  console.log(this[0]); //no idea
  switch (this[0]) {
    case "0":
      return "Mon";
    case "1":
      return "Tue";
    case "2":
      return "Wed";
    case "3":
      return "Thu";
    case "4":
      return "Fri";
    case "5":
      return "Sat";
    default:
      return "Day"; // uh oh
  }
};
function displaySubjects(subjects) {
  const screen = document.getElementById("schedule");
  // screen.innerHTML = "Done";
  for (const subjectName in subjects) {
    const subject = subjects[subjectName];
    let renderedDays = "";
    for (const day in subject.daysWithTimes) {
      if (subject.daysWithTimes[day]) {
        renderedDays += `
        <div class="day-chip-display">${day.dayFromIndex()}</div>
        `;
      }
    }
    const card = `
<div class="card blue-grey darken-1">
  <div class="card-content white-text">
    <span class="card-title">${subjectName}</span>
    <div class='days'>${renderedDays}</div>
  </div>
  <div class="card-action">
    <a href="#">Edit</a>
    <a href="#">Delete</a>
  </div>
</div>
    `;
    screen.innerHTML += card;
  }
  document.getElementById("schedule-loader").style.display = "none";
}
