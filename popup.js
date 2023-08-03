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

  chrome.runtime.sendMessage({
    target: "background",
    type: "UPDATE_START",
    data: null,
  });
});

const noop = function() {};

function updateLoginStates(){
  ["stable", "canary", "ptb"].forEach(function(edition){
    chrome.storage.local.get(`${edition}-users`)
      .then(function(users){
        const editionUsers = users?.[`${edition}-users`];
        const nodes = [];
        if(Array.isArray(editionUsers)){
          const ul = window.document.createElement("ul");
          for(const user of editionUsers){
            const li = window.document.createElement("li");
            const img = window.document.createElement("img");
            img.src = `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.webp?size=32`;
            const span = window.document.createElement("span");
            span.textContent = `${user.username}${!user.discriminator || user.discriminator === "0" ? "" : `#${user.discriminator}`}`;
            li.append(img, span);
            ul.append(li);
          }
          nodes.push(ul);
        }else{
          const span = window.document.createElement("span");
          span.textContent = "No Account detected.";
          nodes.push(span);
        }
        const targetParent = window.document.getElementsByClassName(`accounts-${edition}`)[0];
        for(const child of targetParent.children){
          child.remove();
        }
        targetParent.append.apply(targetParent, nodes);
      })
      .catch(noop);
  });
}

chrome.runtime.onMessage.addListener(function(message){
  if(message.target !== "popup"){
    return;
  }

  console.log("popup", message);

  switch(message.type){
    case "UPDATE_DONE":
      updateLoginStates();
      break;
  }
});
