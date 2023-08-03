const noop = function() {};

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

// https://stackoverflow.com/a/69177790
const iframeHosts = [
  "discord.com",
  "canary.discord.com",
  "ptb.discord.com",
];
chrome.runtime.onInstalled.addListener(() => {
  const RULE = {
    id: 1,
    condition: {
      initiatorDomains: [chrome.runtime.id],
      requestDomains: iframeHosts,
      resourceTypes: ["sub_frame"],
    },
    action: {
      type: "modifyHeaders",
      responseHeaders: [
        {header: "X-Frame-Options", operation: "remove"},
        {header: "Frame-Options", operation: "remove"},
        // Uncomment the following line to suppress `frame-ancestors` error
        // {header: 'Content-Security-Policy', operation: 'remove'},
      ],
    },
  };
  chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: [RULE.id],
    addRules: [RULE],
  });
});

// https://developer.chrome.com/docs/extensions/reference/offscreen/
let offscreenCreating = null;

// for chrome < 116
async function hasOffscreenDocument(offscreenUrl) {
  const matchedClients = await clients.matchAll();

  for (const client of matchedClients) {
    if (client.url === offscreenUrl) {
      return true;
    }
  }
  return false;
}

async function setupOffscreenDocument(){
  const path = "offscreen.html";
  const offscreenUrl = chrome.runtime.getURL(path);

  if(chrome.runtime.getContexts){
    // chrome 116+
    const existingContexts = await chrome.runtime.getContexts({
      contextTypes: ["OFFSCREEN_DOCUMENT"],
      documentUrls: [offscreenUrl],
    });

    if(existingContexts.length > 0){
      return;
    }
  }else if(await hasOffscreenDocument(offscreenUrl)){
    return;
  }

  if(offscreenCreating){
    await offscreenCreating;
  }else{
    offscreenCreating = chrome.offscreen.createDocument({
      url: path,
      reasons: ["LOCAL_STORAGE"],
      justification: "obtain login states",
    }).catch(noop);
    await offscreenCreating;
    offscreenCreating = null;
  }
}

const updateStore = { stable: false, canary: false, ptb: false };
function updateDoneCallback(edition){
  updateStore[edition] = true;
  if(Object.values(updateStore).reduce((prev, c) => prev && c)){
    updateStore.stable = updateStore.canary = updateStore.ptb = false;

    chrome.offscreen.closeDocument();

    return true;
  }

  return false;
}

chrome.runtime.onMessage.addListener(function(message){
  if(message.target !== "background"){
    return;
  }

  console.log("background", message);

  switch(message.type){
    case "UPDATE_DONE":
      if(updateDoneCallback(message.data.edition)){
        chrome.runtime.sendMessage({
          target: "popup",
          type: "UPDATE_DONE",
          data: null,
        });
        chrome.storage.local.set({ lu: Date.now() });
      }
      break;
    case "UPDATE_START":
      chrome.storage.local.get("lu").then(function({ lu }){
        const previousLoginStateUpdated = Number(lu || "0");
        if(Date.now() - previousLoginStateUpdated > 30 * 60 * 1000){
          setupOffscreenDocument();
        }else{
          chrome.runtime.sendMessage({
            target: "popup",
            type: "UPDATE_DONE",
            data: null,
          });
        }
      });
      break;
  }
});
