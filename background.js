chrome.runtime.onMessage.addListener((msg, sender) => {
  if (msg.type === "OPEN_POPUP") {
    chrome.storage.session.set({
      selectedText: msg.payload || ""
    });

    chrome.action.openPopup();
  }
});

chrome.commands.onCommand.addListener((command) => {
  if (command === "open-ai") {
    chrome.action.openPopup();
  }
});
