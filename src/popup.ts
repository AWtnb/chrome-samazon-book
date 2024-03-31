'use strict';

import './popup.css';

const requestToActiveTab = (requestName: string) => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tab = tabs[0];
    if (!tab.id) {
      return;
    }
    chrome.tabs.sendMessage(
      tab.id,
      {
        type: requestName,
      },
      () => {}
    );
  });
};

requestToActiveTab('title');
requestToActiveTab('detail');
requestToActiveTab('author-info');
requestToActiveTab('cover-image');
requestToActiveTab('page-type-check');

const setStatusById = (id: string, status: string) => {
  document.getElementById(id)?.setAttribute('status', status);
};

type Payload = {
  type: string;
  content: string;
};

chrome.runtime.onMessage.addListener((request) => {
  if (!request) {
    return;
  }

  setStatusById('waiting', 'hide');
  if (!request.isBook) {
    setStatusById('warning', 'visible');
    return;
  }

  const payload: Payload = {
    type: request.payload.type,
    content: request.payload.content,
  };

  setStatusById('app', 'visible');

  if (payload.type === 'detail') {
    const elem = document.createElement('div');
    elem.innerHTML = payload.content;
    document.getElementById('to-be-replaced')!.replaceWith(elem);
    return;
  }

  if (payload.type === 'cover-image') {
    document.getElementById(payload.type)!.setAttribute('src', payload.content);
    return;
  }
  document.getElementById(payload.type)!.innerText = payload.content;
});
