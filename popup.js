document.addEventListener('DOMContentLoaded', function() {
  var saveButton = document.getElementById('saveButton');
  var redirectOption = document.getElementById('redirectOption');

  chrome.storage.local.get('redirectOption', function(data) {
    redirectOption.value = data.redirectOption;
  });

  saveButton.addEventListener('click', function() {
    chrome.storage.local.set({ redirectOption: redirectOption.value }, function() {
      console.log('Redirect option saved: ' + redirectOption.value);
    });
    if (redirectOption.value === 'canary') {
      chrome.storage.local.set({ redirectUrl: 'https://canary.discord.com/' });
    } else if (redirectOption.value === 'ptb') {
      chrome.storage.local.set({ redirectUrl: 'https://ptb.discord.com/' });
    } else {
      chrome.storage.local.set({ redirectUrl: 'https://discord.com/' });
    }
  });
});
