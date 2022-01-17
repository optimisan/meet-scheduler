"use-strict";

document.addEventListener("DOMContentLoaded", () => {
  chrome.storage.sync.get(null, (s) => {
    displaySubjects(s);
  });
});
/**
 * Get a random color
 */
const getAColor = () =>
  ["purple", "green", "yellow", "blue"][Math.floor(Math.random() * 4)];

/**
 * Convert daysWithTimes array indices
 * to Day names
 * (Note that the for-in loop on line 19
 * iterates over the indices as `Strings`)
 * Uh that was my old code, now with a forEach loop
 * we get it as a number
 * @returns Day of week
 */
Number.prototype.dayFromIndex = function () {
  // !!Do not use arrow function
  // otherwise "this" will refer to the
  // global window object !!
  //
  // console.log(this[0]); //no idea
  // when this was String.prototype... this[0]
  // was to be used in switch (instead of `this`)
  const num = +this; // convert to primitive
  switch (num) {
    case 0:
      return "Mon";
    case 1:
      return "Tue";
    case 2:
      return "Wed";
    case 3:
      return "Thu";
    case 4:
      return "Fri";
    case 5:
      return "Sat";
    default:
      return "Day"; // uh oh
  }
};

function displaySubjects(subjects) {
  const screen = document.getElementById("schedule-cards");
  screen.innerHTML = "";
  if (Object.keys(subjects).length === 0) {
    screen.innerHTML =
      '<p class="flow-text">You have no meetings yet. Click the "+" icon to add one</p>';
    document.getElementById("add-subject-button").classList.add("pulse");
    document.getElementById("schedule-loader").style.display = "none";
    return;
  }
  document.getElementById("add-subject-button").classList.remove("pulse");
  // screen.innerHTML = "Done";
  // console.log("Sort array", subjects.sortSubjects());
  const subjectsArray = [];
  for (const s in subjects) {
    if (subjects[s].daysWithTimes)
      subjectsArray.push(new Subject(subjects[s], s));
  }
  const sortedSubjects = subjectsArray.sort(
    (a, b) => a.upcomingTime(false) - b.upcomingTime(false)
  );

  // for (const subjectName in subjects) {
  //   const subject = new Subject(subjects[subjectName], subjectName);
  for (const subject of sortedSubjects) {
    // console.log(s.upcomingTime());
    // console.log(subjects[subjectName]);
    // const subject = subjects[subjectName];
    let renderedDays = "";
    // renderedDays = s.getAllTimes();
    let detailedDays = `
    <li class="collection-item avatar">
      <i class="material-icons circle">folder</i>
      <span class="title">Title</span>
      <p>First Line <br>
         Second Line
      </p>
      <a href="#!" class="secondary-content"><i class="material-icons">grade</i></a>
    </li>`;
    // for (const day in subject.daysWithTimes) {
    //   if (subject.daysWithTimes[day]) {
    //     renderedDays += `
    //     <div class="day-chip-display">${day.dayFromIndex()}</div>
    //     `;
    //   }
    // }
    const card = `
<div class="timeline-item" id="timeline-item-${subject.name}">
  <div class="timeline-icon ${subject.disabled}" data-subject-name="${subject.name
      }">
    <i class="material-icons">${subject.icon}</i>
  </div>
  <div class="timeline-content">
    <div class="card ${subject.color} ${subject.disabled}">
      <div class="card-content">
      <span class="new badge" data-badge-caption="">${subject.upcomingTime()}</span>
      ${subject.duration}
        <span class="card-title">${subject.name}</span>
        <div class='days-display'>${subject.getAllTimes()}</div>
      </div>
      <div class="card-action">
        <a class="waves-effect waves-green ${subject.meetingCode()
        ? "meeting-code purple white-text"
        : "normal-url"
      }" href="${subject.meetUrl}" target="_blank"> ${subject.meetingCode() ?? subject.meetUrl
      }</a>
        <div>
        <button data-target="share-subject-modal" class="share-button blue-text waves-effect modal-trigger waves-teal" data-subject-name="${subject.name}">
        <i class="material-icons">share</i></button>
        <button data-target="create-subject-modal" class="edit-button white-text waves-effect modal-trigger waves-teal" data-subject-name="${subject.name
      }"><i class="material-icons">edit</i></button>
        <button class="delete-button red-text waves-effect waves-red" data-subject-name="${subject.name
      }"><i class="material-icons">delete</i></button>
        </div>
      </div>
    </div>
  </div>
</div>
    `;
    screen.innerHTML += card;
  }
  if (screen.innerHTML === "") {
    screen.innerHTML =
      '<p class="flow-text">You have no meetings yet. Click the "+" icon to add one</p>';
    document.getElementById("add-subject-button").classList.add("pulse");
    document.getElementById("schedule-loader").style.display = "none";
    return;
  }
  document.getElementById("schedule-loader").style.display = "none";
  initializeActionButtons();
  initializeDisableSubjects();
}

/**
 * Share, edit and delete buttons
 */
function initializeActionButtons() {
  //Share button
  document.querySelectorAll(".share-button").forEach(button => {
    button.addEventListener("click", () => {
      const name = button.getAttribute("data-subject-name");
      chrome.storage.sync.get(name, (data) => {
        document.getElementById("share-sub-name").innerText = name;
        document.getElementById("share-sub-content").innerText = JSON.stringify(data, null, 2);
      })
    })
  })
  // Delete buttons
  document.querySelectorAll(".delete-button").forEach((button) => {
    button.addEventListener("click", () => {
      const name = button.getAttribute("data-subject-name");
      document.getElementById(`timeline-item-${name}`).classList.add("deleted");
      M.toast({
        html: `<span>Deleted ${name}</span><button class="btn-flat toast-action" id="button-${name}">Undo</button>`,
        displayLength: 6000,
      });
      const deleteTimeOut = setTimeout(() => {
        chrome.alarms
          .clear(name)
          .then((val) => {
            chrome.storage.sync.remove(name, (message) => {
              console.log(message);
            });
          })
          .catch((e) => {
            console.log(e);
            M.toast({ html: "Deletion failed" });
            document
              .getElementById(`timeline-item-${name}`)
              .classList.remove("deleted");
          });
      }, 6300);
      document
        .getElementById(`button-${name}`)
        .addEventListener("click", () => {
          clearTimeout(deleteTimeOut);
          document
            .getElementById(`timeline-item-${name}`)
            .classList.remove("deleted");
          // M.Toast.dismissAll();
        });
    });
  });
  document.querySelectorAll(".edit-button").forEach((button) => {
    button.addEventListener("click", () => {
      const name = button.getAttribute("data-subject-name");
      fillEditModal(name);
    });
  });
}
Number.prototype.fromMidnightToTime = function () {
  const hours = Math.floor(+this / 60);
  const x = hours >= 12 ? "PM" : "AM";
  const minutes = Math.floor(+this % 60);
  return `${hours % 12}:${minutes} ${x}`;
};

// Pre fill edit modal onclick
function fillEditModal(subjectName) {
  document.getElementById("create_subject_button").innerText = "EDIT";
  chrome.storage.sync.get(subjectName, (data) => {
    const subject = data[subjectName];
    document.getElementById("subject_name").value = subjectName;
    document.getElementById("meet_url").value = subject.meetUrl;
    console.log("Meet duration", subject.duration);
    document.getElementById("meet_duration").value = subject.duration;
    let allTimesSame = -2,
      theSameTime,
      timeIndexes = [];
    for (let i = 0; i < subject.daysWithTimes.length; i++) {
      const time = subject.daysWithTimes[i];
      console.log(allTimesSame);
      if (time != null) {
        timeIndexes.push(i);
        theSameTime = time;
        if (allTimesSame === -2) {
          allTimesSame = time;
        } else if (allTimesSame !== -1 && allTimesSame !== time) {
          allTimesSame = -1;
        }

        document.getElementsByClassName("custom-times")[i].value =
          time.fromMidnightToTime();
      }
    }

    if (allTimesSame !== -1) {
      timeIndexes.forEach((i) => {
        document
          .querySelectorAll(".days .day-chip")
        [i].setAttribute("data-selected", "true");
      });
      document.getElementById("repeat-time").value =
        theSameTime.fromMidnightToTime();
    }
    M.updateTextFields();
  });
}
chrome.storage.onChanged.addListener((changes, platform) => {
  chrome.storage.sync.get(null, (s) => {
    displaySubjects(s);
  });
});
