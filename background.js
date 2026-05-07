chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    chrome.tabs.create({ url: chrome.runtime.getURL('options.html') });
  }
});

chrome.runtime.onMessage.addListener((request) => {
  if (request.action === 'openOptions') {
    chrome.tabs.create({ url: chrome.runtime.getURL('options.html') });
  }
});
