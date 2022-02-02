document.querySelector("#go-to-options").addEventListener("click", function () {
  if (chrome.runtime.openOptionsPage) {
    chrome.runtime.openOptionsPage();
  } else {
    window.open(chrome.runtime.getURL("options.html"));
  }
});
function initClick() {
  document.querySelectorAll("div.title").forEach(div => {
    const f = div.addEventListener("click", e => {
      const ele = e.target;
      const link = ele.getAttribute("data-href");
      console.log(link);
    });
  })
}
const now = new Date();
const day = now.getDay() - 1;
const hour = now.getHours();
const minutes = now.getMinutes();
const minutesPastMidnnight = hour * 60 + minutes;
chrome.storage.sync.get(null, data => {
  /**
   * @type {Array<Subject>}
   */
  let currentMeeting = [];
  for (const [subject, json] of Object.entries(data)) {
    console.log(json);
    if (currentMeeting && json.daysWithTimes) {
      // const json = data[subject];
      const startTime = json.daysWithTimes[day];
      console.log(startTime);
      if (startTime <= minutesPastMidnnight && (minutesPastMidnnight - startTime) <= (json.duration || 60)) {
        currentMeeting.push(new Subject({ name: subject, startTime, ...json }));
      }
    }
  }
  console.log(currentMeeting);
  if (currentMeeting.length === 0) {
    document.getElementById("current").innerHTML = "<p>No meeting ongoing.</p>";
    return;
  }
  let cards = "";
  for (const subject of currentMeeting) {
    cards += `<div class="card subject">
        <div class="info">
          <div>
            <a class="title" target="_blank" href="${subject.link}">${subject.name}</a>
            <div>From ${subject.getTimeString()}</div>
          </div>
          <div class="time valign-wrapper">
            <i class="material-icons">schedule</i>
            ${subject.getRemainingTime()}
          </div>
        </div>
        <div class="progress"><div class="bar teal" style="width: ${subject.getBarProgress()}%"></div></div>
      </div>`;
  }
  document.getElementById("current").innerHTML += cards;
  initClick();
})

class Subject {
  constructor({ name, startTime, duration, meetUrl }) {
    this.name = name;
    this.duration = duration || 50;
    this.time = startTime;
    this.link = meetUrl;
  }
  getRemainingTime() {
    const minutes = this.duration - this.getElapsedDuration();
    if (minutes < 60)
      return minutes + "m";
    return `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
  }
  getElapsedDuration() {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    // now.setHours(0,0,0);
    return minutesPastMidnnight - this.time;
  }
  getBarProgress() {
    // const now = new Date();
    // const hours = now.getHours();
    // const minutes = now.getMinutes();
    // const elapsedDuration = this.time - (hours * 60 + minutes);
    return this.getElapsedDuration() / this.duration * 100;
  }
  getTimeString() {
    return `${Math.floor(this.time / 60)}:${this.time % 60}`
  }
}