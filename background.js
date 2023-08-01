chrome.runtime.onInstalled.addListener(function () {
  chrome.storage.local.get(["redirectOption"], function (result) {
    const redirectOption = result.redirectOption;
    if (redirectOption === "canary") {
      chrome.storage.local.set({ redirectUrl: "https://canary.discord.com/" });
    } else if (redirectOption === "ptb") {
      chrome.storage.local.set({ redirectUrl: "https://ptb.discord.com/" });
    } else {
      chrome.storage.local.set({ redirectUrl: "https://discord.com/" });
    }
  });
});
