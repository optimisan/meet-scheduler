// Tabs switching functionality
document.addEventListener("DOMContentLoaded", function () {
  M.AutoInit();
  var time_tabs = M.Tabs.init(document.querySelector(".row-tabs .tabs"), {});
});
///////////
for (const tab of document.querySelectorAll(".side_tab")) {
  // const tab_id = tab.getElementsByClassName("a")[0].href;
  if (tab.classList.contains("tab-active")) {
    const tabId = tab.getAttribute("data-tab").trim();
    document.getElementById(tabId)?.classList.add("tab-active");
  }
  tab.addEventListener("click", (e) => {
    document.querySelectorAll(".tab").forEach((tab) => {
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
////////////Tabs end

document.querySelectorAll(".day-chip").forEach((day) => {
  console.log("hey 1");
  day.addEventListener("click", () => {
    console.log(day["data-selected"]);
    day.setAttribute(
      "data-selected",
      (day.getAttribute("data-selected") == "true" ? false : true).toString()
    );
  });
});

//Create subject

document
  .getElementById("create_subject_button")
  .addEventListener("click", () => {
    // document.getElementById("create-progress").style.display = "block";
    try {
      console.log("Inside try");
      handleCreateSubject(() => {
        var modal = M.Modal.getInstance(
          document.getElementById("create-subject-modal")
        );
        modal.close();
      });
    } catch (e) {
      console.log(e);
    }
  });

function handleCreateSubject(cb) {
  const name = document.getElementById("subject_name").value?.trim();
  console.log(name);
  const url = getUrl(document.getElementById("meet_url").value?.trim());
  console.log(url);
  const daysWithTimes = getRepeatDaysAndTimes();
  console.log(daysWithTimes);
  const subject = {
    daysWithTimes: daysWithTimes,
    meetUrl: url,
    disabled: false,
  };
  chrome.storage.local.set(
    {
      [name]: subject, // computed property
    },
    () => {
      cb();
      createAlarm({ ...subject, name });
    }
  );
  //TODO: Add custom days and times
}
function getUrl(url) {
  const regex = /https?:\/\//gi;
  if (regex.test(url)) return url;
  return "https://meet.google.com/" + url;
}
function getRepeatDaysAndTimes() {
  const time = getMinutesPastMidnight(
    document.getElementById("repeat-time").value
  );

  const daysWithTimes = [];
  document.querySelectorAll(".days .day-chip").forEach((day) => {
    const selected = day.getAttribute("data-selected") === "true";
    if (selected) {
      daysWithTimes.push(time);
    } else {
      daysWithTimes.push(null);
    }
  });
  return daysWithTimes;
}
function getMinutesPastMidnight(time) {
  if (!time) {
    throw new Error("asd");
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
