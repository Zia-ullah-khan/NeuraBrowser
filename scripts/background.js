chrome.commands.onCommand.addListener((command) => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tabId = tabs[0]?.id;
    if (!tabId) return;

    switch (command) {
      case "summarize_content":
        chrome.tabs.sendMessage(tabId, { action: "getAllText" });
        break;
      case "translate_page":
        chrome.tabs.sendMessage(tabId, { action: "translatePage", language: "en" }); // Default language
        break;
      case "privacy_guard_toggle":
        chrome.tabs.sendMessage(tabId, { action: "togglePrivacy" });
        break;
      default:
        console.warn("Unrecognized command:", command);
    }
  });
});
