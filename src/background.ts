/**
 * 指定したサイトでのみポップアップを有効化する
 * https://geniusium.hatenablog.com/entry/2023/05/04/082017
 */
'use strict';

const isTargetPage = (url: string): boolean => {
  const targets = ['https://www.amazon.co.jp/', 'https://www.amazon.com/'];
  const found = targets.filter((u) => {
    return url.startsWith(u) && url.indexOf('/dp/') != -1;
  });
  return 0 < found.length;
};

const updateConfig = (url: string) => {
  const flag = isTargetPage(url);
  const popupPath = flag ? './popup.html' : '';
  const iconPath = flag
    ? './icons/cremesoda01_128.png'
    : './icons/icon_128.png';
  chrome.action.setPopup({ popup: popupPath }).then(() => {
    // chrome.action.setIcon({ path: iconPath });
  });
};

chrome.tabs.onActivated.addListener((activeInfo: chrome.tabs.TabActiveInfo) => {
  chrome.tabs.get(activeInfo.tabId, (tab: chrome.tabs.Tab) => {
    if (!tab.url) {
      return;
    }
    updateConfig(tab.url);
  });
});

chrome.tabs.onUpdated.addListener(
  (_: number, change: chrome.tabs.TabChangeInfo, tab: chrome.tabs.Tab) => {
    if (!tab.active || !change.url || !tab.url) {
      return;
    }
    updateConfig(tab.url);
  }
);
