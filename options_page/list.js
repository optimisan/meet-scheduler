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
  const screen = document.getElementById("schedule-cards");
  if (Object.keys(subjects).length === 0) {
    screen.innerHTML =
      '<p class="flow-text">You have no meetings yet. Click the "+" icon to add one</p>';
  }
  // screen.innerHTML = "Done";
  for (const subjectName in subjects) {
    console.log(subjects[subjectName]);
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
<div class="timeline-item">
  <div class="timeline-icon">
    <i class="material-icons">check</i>
  </div>
  <div class="timeline-content">
    <div class="card blue">
      <div class="card-content">
        <span class="card-title">${subjectName}</span>
        <div class='days-display'>${renderedDays}</div>
        <a href="#!" class="activator">Times</a>
      </div>
      <div class="card-reveal">
      <span class="card-title grey-text text-darken-4">Card Title<i class="material-icons right">close</i></span>
      <p>Here is some more information about this product that is only revealed once clicked on.</p>
    </div>
      <div class="card-action">
        <a href="#">Edit</a>
        <a href="#">Delete</a>
      </div>
    </div>
  </div>
</div>
    `;
    screen.innerHTML += card;
  }
  document.getElementById("schedule-loader").style.display = "none";
}

function editing(subjectName) {}
