'use strict';

import './popup.css';
import { Request } from './contentScript';

const requestToActiveTab = (requestName: string) => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tab = tabs[0];
    if (!tab.id) {
      return;
    }
    chrome.tabs.sendMessage(tab.id, {
      type: requestName,
      payload: 'greeting-for-tab',
    });
  });
};

requestToActiveTab('page-type-check');
requestToActiveTab('title');
requestToActiveTab('detail');
requestToActiveTab('author-info');
requestToActiveTab('cover-image');
requestToActiveTab('search-info');

chrome.runtime.onMessage.addListener((request) => {
  if (!request.type || !request.payload) {
    return;
  }

  const req = new Request(request.type, request.payload);

  if (req.type === 'page-type-answer') {
    if (req.payload === 'book-page') {
      document.getElementById('default')!.classList.add('hidden');
      document.getElementById('app')!.classList.remove('hidden');
      return;
    }
    document.getElementById('default')!.innerText =
      'この商品は書籍ではありません';
    return;
  }

  if (req.type === 'detail') {
    const elem = document.createElement('div');
    elem.innerHTML = req.payload;
    document.getElementById('to-be-replaced')!.replaceWith(elem);
    return;
  }

  if (req.type === 'cover-image') {
    document.getElementById(req.type)!.setAttribute('src', req.payload);
    return;
  }

  if (req.type === 'search-info') {
    document.getElementById(req.type)!.addEventListener('click', () => {
      const to =
        'http://www.google.co.jp/search?q=' + encodeURIComponent(req.payload);
      window.open(to, '_blank');
    });
    return;
  }

  if (req.payload) document.getElementById(req.type)!.innerText = req.payload;
});
