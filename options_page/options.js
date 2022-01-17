// Tabs switching functionality and time validation
document.addEventListener("DOMContentLoaded", function () {
  M.AutoInit();
  var time_tabs = M.Tabs.init(document.querySelector(".row-tabs .tabs"), {});
  M.Sidenav.init(document.querySelector(".sidenav"), {});

  // time validation
  [...document.getElementsByClassName("timepicker")].forEach((ele) => {
    ele.classList.add("validate");
    ele.setAttribute("pattern", "\\d{2}:\\d{2} [AP]M");
  });
  // clear fields when user cancels modal
  document
    .getElementById("cancel-subject-modal")
    .addEventListener("click", clearFields);

  /////////// Switch tabs
  chrome.storage.sync.get("firstLoad", (data) => {
    const firstLoad = data.firstLoad;
    if (firstLoad) {
      document.querySelectorAll(".side_tab").forEach((tab) => {
        tab.classList?.remove("active");
      });
      document.querySelector('li[data-tab="about"]').classList.add("active");
      document.getElementById("about")?.classList.add("tab-active");
    }
    chrome.storage.sync.remove("firstLoad");
  });
  for (const tab of document.querySelectorAll(".side_tab")) {
    // const tab_id = tab.getElementsByClassName("a")[0].href;
    if (tab.classList.contains("tab-active")) {
      const tabId = tab.getAttribute("data-tab").trim();
      document.getElementById(tabId)?.classList.add("tab-active");
    }
    tab.addEventListener("click", (e) => {
      document.querySelectorAll(".side_tab").forEach((tab) => {
        tab.classList?.remove("active");
      });
      tab.classList?.add("active");
      e.preventDefault();
      const tabId = tab.getAttribute("data-tab").trim();

      document.querySelectorAll(".tab-content").forEach((tab) => {
        tab.classList?.remove("tab-active");
      });
      document.getElementById(tabId)?.classList.add("tab-active");
    });
  }
});
////////////Tabs end

document.querySelectorAll(".day-chip").forEach((day) => {
  day.addEventListener("click", () => {
    day.setAttribute(
      "data-selected",
      (day.getAttribute("data-selected") == "true" ? "false" : "true")
    );
  });
});

//Check which days mode to use(custom or repeat)

// Code taken from
// https://stackoverflow.com/questions/1759987/listening-for-variable-changes-in-javascript
var customSelected = {
  theValue: false,
  aListener: function (val) { },
  set value(val) {
    this.theValue = val;
    this.aListener(val);
  },
  get value() {
    return this.theValue;
  },
  registerListener: function (listener) {
    this.aListener = listener;
  },
};

document.getElementById("repeat-mode").addEventListener("click", () => {
  customSelected.value = false;
});
document.getElementById("custom-mode").addEventListener("click", () => {
  checkDayMode();
});
// Change shown label beside 'Choose Days'
customSelected.registerListener(function (val) {
  if (val) return (document.getElementById("days-type").innerText = "(Custom)");
  document.getElementById("days-type").innerText = "(Repeat)";
});

[...document.querySelectorAll("input.custom-times")].forEach((ele) => {
  ele.addEventListener("focus", () => {
    checkDayMode();
  });
});

function checkDayMode() {
  var customSelected = false;
  [...document.querySelectorAll("input.custom-times")].forEach((input) => {
    if (input.value) {
      customSelected = true;
    }
  });
  window.customSelected.value = customSelected;
}
/// End custom selection handler

document.getElementById("add-subject-button").addEventListener("click", (e) => {
  e.currentTarget.classList.remove("pulse");
  clearFields();
});

//Create subject
document
  .getElementById("create_subject_button")
  .addEventListener("click", () => {
    document.getElementById("create-progress").style.display = "block";
    try {
      console.log("Inside try");
      handleCreateSubject(() => {
        var modal = M.Modal.getInstance(
          document.getElementById("create-subject-modal")
        );
        modal.close();
      });
    } catch (error) {
      console.log(error);
      // Finally found a way to use the 'rest parameters'
      // Errors are thrown as arrays like [0,0,0]
      // The showError function gets array elements
      // as positional parameters
      if (Array.isArray(error))
        //safety
        showError(...error);
      else {
        // eh just some little error of which I have no idea of
        M.toast({ html: "Something went wrong" });
      }
    } finally {
      document.getElementById("create-progress").style.display = "none";
    }
  });

function handleCreateSubject(cb) {
  const name = document.getElementById("subject_name").value?.trim();
  console.log(name);
  if (!name) return M.toast({ html: "Subject name cannot be empty" });
  const url = getUrl(document.getElementById("meet_url").value?.trim());
  const duration = document.getElementById("meet_duration").value;
  if (duration < 0)
    return M.toast({ html: "Meeting duration cannot be negative" });
  try {
    const daysWithTimes = customSelected.value
      ? getCustomDaysAndTimes()
      : getRepeatDaysAndTimes();
    console.log(daysWithTimes);
    const subject = {
      daysWithTimes,
      meetUrl: url,
      disabled: false,
      duration,
    };
    // check if subject exists
    chrome.storage.sync.get(name, function (data) {
      console.log("data", data);
      const buttonType = document.getElementById(
        "create_subject_button"
      ).innerText;
      if (typeof data[name] === "undefined") {
        chrome.storage.sync.set(
          {
            [name]: subject, // computed property
          },
          () => {
            cb();
            createAlarm({ ...subject, name });
            clearFields();
          }
        );
      } else {
        if (buttonType === "EDIT") {
          chrome.storage.sync.set(
            {
              [name]: subject, // computed property
            },
            () => {
              cb();
              createAlarm({ ...subject, name });
              clearFields();
            }
          );
        } else showError(1);
      }
    });
  } catch (error) {
    // console.log(error);
    if (Array.isArray(error))
      //for safety check if array
      showError(...error);
    else {
      // eh just some little error of which I have no idea of
      // M.toast({ html:  });
      console.log(error);
    }
  }
}
function getUrl(url) {
  const regex = /https?:\/\//gi;
  if (regex.test(url)) return url;
  const gmeetRegEx = /^\w{3}\-\w{4}-\w{3}$/gi;
  if (gmeetRegEx.test(url)) return "https://meet.google.com/" + url;
  else {
    // showError(false, false, true);
    // throw new Error("Invalid URL");
    throw [0, 0, 1];
  }
}
function getRepeatDaysAndTimes() {
  const time = getMinutesPastMidnight(
    document.getElementById("repeat-time").value
  );

  const daysWithTimes = [];
  var atleastOneSelected = false;
  document.querySelectorAll(".days .day-chip").forEach((day) => {
    const selected = day.getAttribute("data-selected") === "true";
    if (selected) {
      daysWithTimes.push(time);
      atleastOneSelected = true;
    } else {
      daysWithTimes.push(null);
    }
  });
  if (atleastOneSelected) return daysWithTimes;
  else {
    M.toast({ html: "No days selected" });
    throw "No days selected";
  }
}
function getCustomDaysAndTimes() {
  const daysWithTimes = [];
  var atleastOneSelected = false;
  document.querySelectorAll("input.custom-times").forEach((input) => {
    const time = input.value;
    if (time) {
      daysWithTimes.push(getMinutesPastMidnight(time));
      atleastOneSelected = true;
    } else {
      daysWithTimes.push(null);
    }
  });
  if (atleastOneSelected) return daysWithTimes;
  else {
    M.toast({ html: "No days selected" });
    throw "No days selected";
  }
}
function getMinutesPastMidnight(time) {
  const regex = /^\d{1,2}:\d{1,2} [AP]M$/g;
  console.log(time);
  const isValid = regex.test(time);
  if (!time || !isValid) {
    throw [0, !time, 0, !isValid];
  }
  var offsetFromMidnight = 0;
  if (time.includes("PM")) {
    offsetFromMidnight = 720;
  }
  var splitTime = time.split(":");
  let hours = Number.parseInt(splitTime[0], 10);
  if (hours == 12) hours = 0;
  splitTime[1] = splitTime[1].replace(/[A-Z]/gi, "");
  const minutes = Number.parseInt(splitTime[1], 10);
  const totalMinutes = offsetFromMidnight + hours * 60 + minutes;
  return totalMinutes;
}

function showError(subjectName, alarmCreation, URL, timeInvalid) {
  if (subjectName) {
    document.getElementById("subject_name").classList.add("invalid");
    M.toast({ html: "Subject already exists" });
  } else {
    document.getElementById("subject_name").classList.remove("invalid");
  }
  if (URL) {
    document.getElementById("meet_url").classList.add("invalid");
    M.toast({ html: "Invalid URL format" });
  } else {
    document.getElementById("meet_url").classList.remove("invalid");
  }
  if (alarmCreation) {
    document.getElementById("repeat-time").classList.add("invalid");
    M.toast({ html: "Time not specified" });
  } else {
    document.getElementById("repeat-time").classList.remove("invalid");
  }
  if (timeInvalid) {
    M.toast({ html: "Invalid time format. Must be HH:MM AM/PM" });
  }
}
function clearFields() {
  console.log("clearing");
  document.getElementById("subject_name").disabled = false;
  [
    ...document.getElementsByClassName("form")[0].getElementsByTagName("input"),
  ].forEach((ele) => (ele.value = ""));
  document.getElementById("create_subject_button").innerText = "CREATE";
  [...document.getElementsByClassName("custom-times"), ...document.getElementsByClassName("day-chip")].forEach((ele) =>
    ele.setAttribute("data-selected", "false")
  );
}
