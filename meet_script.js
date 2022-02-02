// End call listener is in endCall-script.js
const toast = document.createElement("div");
toast.classList.add("error-toast");
if (location.pathname !== "/") {
  document.body.insertAdjacentElement("beforeend", toast);
}

// There should be a better way to wait for the page
// to load completely but lemme use this for now

console.log(location.toString());
let meetingName;
setTimeout(() => {
  chrome.storage.sync.get(null, (s) => {
    findJoinButton();
    let executeScript = false;
    // let meetName;
    for (const subjectName in s) {
      console.log(s[subjectName]);
      if (window.location.href.includes(s[subjectName].meetUrl)) {
        executeScript = true;
        meetingName = subjectName;
        break;
      }
    }
    if (!executeScript) return;
    executeJoin(s.autoJoin, s.showQuickMessage);
    displayMeetingName();
  });
}, 5000);

function showNameOnJoinScreen() {
  console.log("showing name");
  document.querySelectorAll('div[jsaction^="mouseover"]').forEach(div => {
    if (/join\b/.test(div.innerText)) {
      div.insertAdjacentHTML("afterend", `<div style="color:teal">${meetingName}</div>`);
      // div.style.color = "red";
    }
  })
}

function executeJoin(autoJoin, showQuickMessage) {
  // Join the meet
  try {
    // console.log(location.pathname);
    if (location.pathname !== "/") {
      prepareToJoin();
      if (autoJoin) joinMeeting();
      addButton(showQuickMessage);
    }
  } catch (e) {
    setTimeout(() => {
      try {
        prepareToJoin();
        if (autoJoin) joinMeeting();
        addButton(showQuickMessage);
      } catch (e) {
        console.log(e);
        _showError("Could not turn off microphone and camera and join");
        setTimeout(() => {
          try {
            prepareToJoin();
          } catch (e) {
            console.log(e);
          }
        }, 1500);
      }
    }, 2000);
  }
}

function _showError(message) {
  toast.innerText = message;
  toast.style.display = "block";
  setTimeout(() => {
    toast.style.display = "none";
  }, 8000);
}
/**
 * Turn off microphone and camera
 */
function prepareToJoin() {
  showNameOnJoinScreen();
  try {
    document.querySelector('div[aria-label^="Turn off microphone ("]').click();
    document.querySelector('div[aria-label^="Turn off camera ("]').click();
  } catch (e) {
    (
      document.querySelector('div[aria-label="Turn off camera (CTRL + E)"]') ||
      document.querySelector('div[aria-label="Turn off camera (ctrl + e)"]')
    ).click();
    (
      document.querySelector(
        'div[aria-label="Turn off microphone (CTRL + D)"]'
      ) ||
      document.querySelector('div[aria-label="Turn off microphone (ctrl + d)"]')
    ).click();
  }
}
let joinButton;
function findJoinButton() {
  document.querySelectorAll("div[role='button']").forEach((button) => {
    // console.log(button);
    const span = button.querySelector(" span span");
    // console.log(span.innerHTML);
    const regex = /(ask to join)|(join now)/gi;
    if (regex.test(span.innerHTML)) {
      joinButton = button;
      return button;
    }
  });
}
function joinMeeting() {
  joinButton.click();
  // document.querySelectorAll("div[role='button']").forEach((button) => {
  //   // console.log(button);
  //   const span = button.querySelector(" span span");
  //   // console.log(span.innerHTML);
  //   const regex = /(ask to join)|(join now)/gi;
  //   if (regex.test(span.innerHTML)) {
  //     joinButton = button;
  //     button.click();
  //     button.style.background = "red";
  //   }
  // });
}
function addButton(showQuickMessage) {
  if (showQuickMessage)
    fetch(chrome.runtime.getURL("/google-meet.html"))
      .then((r) => r.text())
      .then((html) => {
        try {
          // console.log(html);
          document.body
            // .querySelector('textarea[aria-label="Send a message to everyone"]')
            .insertAdjacentHTML("beforeend", html);
          document
            .getElementById("send-message-google-meet")
            .addEventListener("click", sendIntroMessage);
          // addListeners();
          // not using innerHTML as it would break js event listeners of the page}
        } catch (e) {
          console.log(e);
          // setTimeout(() => {
          //   document
          //     .querySelector('textarea[aria-label="Send a message to everyone"]')
          //     .insertAdjacentHTML("beforeend", html);
          // }, 2000);
        }
      });
}

function sendIntroMessage() {
  const self = this;
  chrome.storage.sync.get("showQuickMessage", (s) => {
    if (s.showQuickMessage)
      chrome.storage.sync.get("quickMessage", (m) => {
        const message = m["quickMessage"] ?? "Good day";
        function sendIt() {
          document.querySelector(
            'textarea[aria-label="Send a message to everyone"]'
          ).value = message;
          const sendButton = document.querySelector(
            'button[aria-label="Send a message to everyone"]'
          );
          sendButton.disabled = false;
          sendButton.click();
        }
        try {
          sendIt();
        } catch (e) {
          try {
            document.querySelector('[aria-label="Chat with everyone"]').click();
            self.style.display = "none";
            setTimeout(() => {
              sendIt();
            }, 800);
          } catch (e) {
            console.log(e);
            _showError("Could not send message. Did you join the meeting?");
          }
        }
      });
  });
}

function endMeeting() {
  if (document.querySelector('button[aria-label="Leave call"]'))
    document.querySelector('button[aria-label="Leave call"]').click();
  else {
    chrome.runtime.sendMessage({ closeTab: true });
  }
  try {
    document.getElementById("send-message-google-meet").style.display = "none";
  } catch (e) {
    console.log(e);
  }
}
// Replace link code with meeting name
function displayMeetingName() {
  //joinButton?
  if (!nameWasInserted)
    document.addEventListener("click", () => {
      findDivAndInsertName(meetingName);
    });
  // findJoinButton().addEventListener("click", (e) => {
  //   console.log("event listener");
  //   setTimeout(() => {
  //     if (!findDivAndInsertName()) {
  //       setTimeout(() => {
  //         findDivAndInsertName();
  //       }, 2000);
  //     }
  //   }, 5000);
  // })
}
let nameWasInserted = false;
/**
 * Finds the code link div(bottom left) and replaces 
 * the link with provided subject name
 * @param {String} n Meeting name
 * @returns whether it was successful
 */
function findDivAndInsertName(n) {
  if (nameWasInserted) return;
  document.querySelectorAll('div[jsaction^="mouseover"]').forEach(div => {
    if (/\w{3}-\w{4}-\w{3}/.test(div.innerText)) {
      div.innerText = n;
      nameWasInserted = true;
      return true;
    }
  })
  return false;
}
//draggable button
// window.onload = addListeners;
// window.onload = addListeners;

function addListeners() {
  document
    .getElementById("send-message-google-meet")
    .addEventListener("mousedown", mouseDown, false);
  window.addEventListener("mouseup", mouseUp, false);
}

function mouseUp() {
  window.removeEventListener("mousemove", divMove, true);
}

function mouseDown(e) {
  window.addEventListener("mousemove", divMove, true);
}
function divMove(e) {
  var div = document.getElementById("send-message-google-meet");
  div.style.position = "fixed";
  div.style.top = e.clientY + "px";
  div.style.left = e.clientX + "px";
}
