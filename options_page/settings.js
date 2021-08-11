document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("turn-off").addEventListener("click", () => {
    chrome.storage.local.get(null, async (s) => {
      for (const subjectName in s) {
        if (s[subjectName].daysWithTimes) {
          chrome.storage.local.set({
            [subjectName]: { ...s[subjectName], disabled: true },
          });
        }
      }
      await chrome.alarms.clearAll();
      M.toast({ html: "Disabled all meetings", classes: "green" });
    });
  });
  // set initial stored values
  setValues();

  document.getElementById("delete_all").addEventListener("click", async () => {
    chrome.storage.local.clear();
    await chrome.alarms.clearAll();
    M.toast({ html: "Deleted all meetings", classes: "red" });
  });

  // Save quick message
  var debouncedOnInput = debounce(saveQuickMessage, 500);
  document
    .getElementById("quick_message")
    .addEventListener("input", debouncedOnInput);

  // Turn on Auto join
  document.getElementById("auto_join_meet").addEventListener("change", (e) => {
    // localStorage.setItem("autoJoin", e.target.checked);
    chrome.storage.local.set({ autoJoin: e.target.checked });
  });
  document
    .getElementById("auto_end_meet")
    .addEventListener("change", function () {
      // localStorage.setItem("autoEnd", this.value);
      chrome.storage.local.set({ autoEnd: this.value });
    });

  document
    .getElementById("show_quick_message")
    .addEventListener("change", (e) => {
      // localStorage.setItem("showQuickMessage", e.target.checked);
      chrome.storage.local.set({ showQuickMessage: e.target.checked });
    });
});
function saveQuickMessage(e) {
  const message = e.target.value;
  // localStorage.setItem("quickMessage", message);
  chrome.storage.local.set({ quickMessage: message });
}
function debounce(funcToExecute, period) {
  let timeout;
  return function () {
    var context = this,
      args = arguments;
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      funcToExecute.apply(context, args);
    }, period);
  };
}
function setValues() {
  chrome.storage.local.get(null, (localStorage) => {
    document.getElementById("auto_end_meet").value =
      localStorage.autoEnd ?? "off";
    M.FormSelect.init(document.getElementById("auto_end_meet"), {});
    //
    document.getElementById("auto_join_meet").checked = localStorage.autoJoin; // == "true";
    document.getElementById("show_quick_message").checked =
      localStorage.showQuickMessage; //== "true";
    document.getElementById("quick_message").value =
      localStorage.quickMessage ?? "John Doe 2020WEDN12XX";
  });
}
