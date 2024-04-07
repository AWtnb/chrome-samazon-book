/**
 * 指定したサイトでのみポップアップを有効化する
 * https://geniusium.hatenablog.com/entry/2023/05/04/082017
 */
'use strict';

import { requestToContentScript, BackgroundInfo, ContentInfo } from './helper';

const isTargetPage = (url: string): boolean => {
  const targets = ['https://www.amazon.co.jp/', 'https://www.amazon.com/'];
  const found = targets.filter((target) => {
    return url.startsWith(target) && url.indexOf('/dp/') != -1;
  });
  return 0 < found.length;
};

const updateConfig = (url: string) => {
  const flag = isTargetPage(url);
  const popupPath = flag ? './popup.html' : '';
  chrome.action.setIcon({ path: './icons/book_128_gray.png' });
  chrome.action.setPopup({ popup: popupPath });
  if (flag) {
    requestToContentScript(BackgroundInfo.CheckForIcon);
  }
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

chrome.runtime.onMessage.addListener((request) => {
  if (
    (request.type === 'dom-loading-status' &&
      request.payload === 'completed') ||
    (request.type === BackgroundInfo.AnswerForIcon &&
      request.payload === ContentInfo.BookPage)
  ) {
    chrome.action.setIcon({
      path: './icons/book_128.png',
    });
    return;
  }

  if (request.type === 'answer-for-icon' && request.payload !== 'book-page') {
    chrome.action.setIcon({
      path: './icons/book_128_gray.png',
    });
    return;
  }
});
