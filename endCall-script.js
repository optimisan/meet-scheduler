// console.log("End call script");
chrome.runtime.onMessage.addListener(function (req, sender, response) {
  if (req.url !== location) {
    response({ notThisTab: "hmm" });
  }
  if (req.endMeetMethod === "call") {
    if (document.getElementById("send-message-google-meet"))
      document.getElementById("send-message-google-meet").style.display =
        "none";
    if (document.querySelector('button[aria-label="Leave call"]')) {
      document.querySelector('button[aria-label="Leave call"]').click();
      chrome.runtime.sendMessage({
        sendNotification: true,
        message: "Closed meeting " + location,
      });
    } else {
      chrome.runtime.sendMessage({ closeTab: true });
    }
  } else if (req.endMeetMethod === "tab") {
    chrome.runtime.sendMessage({ closeTab: true });
  }
});
