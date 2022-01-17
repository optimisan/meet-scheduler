document.getElementById("import-button").addEventListener("click", e => {
  const data = document.getElementById("json-import").value;
  try {
    const json = JSON.parse(data);
    const validJson = {}
    for (const key in json) {
      const subject = json[key];
      console.log(key, json[key]);
      if (subject.daysWithTimes) {
        validJson[key] = subject;
      }
    }
    //save
    chrome.storage.sync.set(validJson);
    //create alarms for all
    for (const key in validJson) {
      createAlarm({ ...validJson[key], name: key });
    }
    M.toast({ html: `Succesfully imported ${Object.keys(validJson).length} subjects`, classes: "green" });
    //clear the input
    document.getElementById("json-import").value = "";

  } catch (error) {
    M.toast({ html: "Failed to import JSON", classes: "red" });
  }
})