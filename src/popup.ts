'use strict';

import './popup.css';
import {
  Request,
  PopupInfo,
  ContentInfo,
  requestToContentScript,
} from './helper';

requestToContentScript(PopupInfo.PageTypeCheck);
requestToContentScript(PopupInfo.Title);
requestToContentScript(PopupInfo.Detail);
requestToContentScript(PopupInfo.AuthorInfo);
requestToContentScript(PopupInfo.CoverImage);
requestToContentScript(PopupInfo.SearchInfo);

chrome.runtime.onMessage.addListener((request) => {
  if (!request.type || !request.payload) {
    return;
  }

  const req = new Request(request.type, request.payload);

  if (req.type === ContentInfo.PageTypeAnswer) {
    if (req.payload === ContentInfo.BookPage) {
      document.getElementById('default')!.classList.add('hidden');
      document.getElementById('app')!.classList.remove('hidden');
      return;
    }
    document.getElementById('default')!.innerText =
      'この商品は書籍ではありません';
    return;
  }

  if (req.type === PopupInfo.Detail) {
    const elem = document.createElement('div');
    elem.innerHTML = req.payload;
    document.getElementById('to-be-replaced')!.replaceWith(elem);
    return;
  }

  if (req.type === PopupInfo.CoverImage) {
    document.getElementById(req.type)!.setAttribute('src', req.payload);
    return;
  }

  if (req.type === PopupInfo.SearchInfo) {
    document.getElementById(req.type)!.addEventListener('click', () => {
      const to =
        'http://www.google.co.jp/search?q=' + encodeURIComponent(req.payload);
      window.open(to, '_blank');
    });
    return;
  }

  if (req.payload) document.getElementById(req.type)!.innerText = req.payload;
});
