const currentUrl = window.location.href;
const url = new URL(currentUrl);

chrome.storage.local.get(["redirectUrl"], function (result) {
  const redirectUrl = result.redirectUrl;

  if(redirectUrl){
    if(url.pathname === "/robots.txt"){
      return;
    }

    if(url.hostname.includes("discord.com")){
      const redirectUrlObject = new URL(redirectUrl);
      const preferredHost = redirectUrlObject.hostname;
      if(url.hostname !== preferredHost){
        url.hostname = preferredHost;
        window.location.replace(url.href);
      }
    }
  }
});

function updateLoginState(){
  const users = JSON.parse(window.localStorage.getItem("MultiAccountStore") || "{}")._state?.users;
  let edition = url.hostname.split(".")[0];
  if(edition === "discord") {
    edition = "stable";
  }
  chrome.storage.local.set({ [`${edition}-users`]: users });
  return edition;
}

if(url.pathname === "/robots.txt"){
  const edition = updateLoginState();
  chrome.runtime.sendMessage({
    target: "background",
    type: "UPDATE_DONE",
    data: { edition },
  });
}
