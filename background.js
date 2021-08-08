chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  console.log(request);
  chrome.alarms.create("asd", {
    delayInMinutes: 0.1,
  });

  // chrome.tabs.create({ url: "https://meet.google.com" });
});
chrome.alarms.onAlarm.addListener((alarm) => {
  console.log(alarm.name);
});
