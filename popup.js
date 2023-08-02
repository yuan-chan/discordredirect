document.addEventListener("DOMContentLoaded", function () {
  var saveButton = document.getElementById("saveButton");
  var redirectOption = document.getElementById("redirectOption");

  chrome.storage.local.get("redirectOption", function (data) {
    redirectOption.value = data.redirectOption || "stable";
  });

  saveButton.addEventListener("click", function (e) {
    chrome.storage.local.set(
      { redirectOption: redirectOption.value },
      function () {
        console.log("Redirect option saved: " + redirectOption.value);
      }
    );
    if (redirectOption.value === "canary") {
      chrome.storage.local.set({ redirectUrl: "https://canary.discord.com/" });
    } else if (redirectOption.value === "ptb") {
      chrome.storage.local.set({ redirectUrl: "https://ptb.discord.com/" });
    } else {
      chrome.storage.local.set({ redirectUrl: "https://discord.com/" });
    }

    const { currentTarget } = e;
    const originalText = currentTarget.textContent;
    currentTarget.textContent = "Saved!";
    setTimeout(function(){
      currentTarget.textContent = originalText;
    }, 3000);
  });
});

window.addEventListener("load", function(){
  const buttons = window.document.querySelectorAll("button");
  for(const button of buttons){
    button.addEventListener("pointerdown", function(e){
      window.ripplet(e, {
        spreadingDuration: "0.2s"
      });
    });
  }
});
