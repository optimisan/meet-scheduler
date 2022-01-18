document.getElementById("import-button").addEventListener("click", e => {
  const data = document.getElementById("json-import").value;
  try {
    const json = JSON.parse(data);
    const validJson = {}
    for (const key in json) {
      const subject = json[key];
      console.log(key, json[key]);
      if (subject.daysWithTimes && subject.meetUrl) {
        validJson[key] = subject;
      }
    }
    //save
    chrome.storage.sync.set(validJson);
    //create alarms for all
    for (const key in validJson) {
      createAlarm({ ...validJson[key], name: key });
    }
    const validSubjects = Object.keys(validJson).length
    if (validSubjects == 0) {
      M.toast({ html: "JSON is invalid, please check again", classes: "red" });
    } else
      M.toast({ html: `Succesfully imported ${validSubjects} subject${validSubjects == 1 ? "" : "s"}`, classes: "green" });
    //clear the input
    document.getElementById("json-import").value = "";

  } catch (error) {
    M.toast({ html: "Failed to import JSON", classes: "red" });
  }
})
document.getElementById("copy-json-button").addEventListener("click", (e) => {
  navigator.clipboard.writeText(document.getElementById("share-sub-content").innerText).then(function () {
    M.toast({ html: "Copied to clipboard", classes: "green" })
  }, function (err) {
    M.toast({ html: "Failed to copy to clipboard", classes: "red" })
  });
})