chrome.storage.local.get(['redirectUrl'], function(result) {
  const redirectUrl = result.redirectUrl;
  if (redirectUrl) {
    const currentUrl = window.location.href;
    const url = new URL(currentUrl);
    if ((currentUrl.includes('discord.com') || currentUrl.includes('.discord.com')) && !currentUrl.includes(redirectUrl)) {
      var newUrl = redirectUrl.slice(0,-1) + url.pathname + url.search + url.hash;
      window.location.href = newUrl;
    }
  }
});