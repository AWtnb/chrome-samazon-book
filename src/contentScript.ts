'use strict';
import {
  Request,
  sendRuntimeMessage,
  MessageTo,
  PopupInfo,
  ContentInfo,
  BackgroundInfo,
} from './helper';

const getDetailListElem = (): HTMLElement | null => {
  return document.querySelector<HTMLElement>('#detailBullets_feature_div ul');
};

const checkBookPage = (): boolean => {
  const elem = getDetailListElem();
  if (!elem) {
    return false;
  }
  return elem.innerText.indexOf('ISBN') != -1;
};

const getBookTitle = (): string => {
  return document.getElementById('productTitle')?.innerText || '';
};

const getPublisher = (): string => {
  const elem = document.querySelector<HTMLElement>(
    '#rpi-attribute-book_details-publisher .rpi-attribute-value span'
  );
  return elem?.innerHTML || '';
};

const getAuthorInfo = (): string[] => {
  return Array.from(
    document.querySelectorAll<HTMLElement>(
      '#bylineInfo .author > .a-link-normal'
    )
  )
    .map((el) => el.innerText)
    .filter((s) => s.length);
};

const getCoverImageSrc = (): string => {
  const elem = document.getElementById('landingImage');
  if (!elem) {
    return '';
  }
  const thunmb = elem.getAttribute('src');
  if (!thunmb) {
    return '';
  }
  return thunmb.substring(0, 47) + '.' + thunmb.split('.').slice(-1)[0];
};

chrome.runtime.onMessage.addListener((request) => {
  if (!request.type || request.payload !== 'greeting-for-tab') {
    return;
  }
  if (document.readyState !== 'complete') {
    return;
  }

  const req = new Request(request.type, request.payload);

  if (req.type === BackgroundInfo.CheckForIcon) {
    const payload = checkBookPage()
      ? ContentInfo.BookPage
      : ContentInfo.NonBookPage;
    sendRuntimeMessage(
      MessageTo.background,
      BackgroundInfo.AnswerForIcon,
      payload
    );
    return;
  }

  if (req.type === PopupInfo.PageTypeCheck) {
    const payload = checkBookPage()
      ? ContentInfo.BookPage
      : ContentInfo.NonBookPage;
    sendRuntimeMessage(MessageTo.popup, ContentInfo.PageTypeAnswer, payload);
    return;
  }

  if (req.type === PopupInfo.SearchInfo) {
    const title = getBookTitle();
    const publisher = getPublisher();
    const content = publisher + ' ' + title;
    req.replyWith(content);
    return;
  }

  if (req.type === PopupInfo.Title) {
    const content = getBookTitle();
    req.replyWith(content);
    return;
  }

  if (req.type === PopupInfo.Detail) {
    const elem = getDetailListElem();
    if (!elem) {
      return '';
    }
    const content = elem.outerHTML;
    req.replyWith(content);
    return;
  }

  if (req.type === PopupInfo.AuthorInfo) {
    const content = getAuthorInfo().join('・');
    req.replyWith(content);
    return;
  }

  if (req.type === PopupInfo.CoverImage) {
    const content = getCoverImageSrc();
    req.replyWith(content);
    return;
  }
});

const observer = new MutationObserver(() => {
  if (checkBookPage()) {
    sendRuntimeMessage(MessageTo.content, 'dom-loading-status', 'completed');
    observer.disconnect();
  }
});
observer.observe(document, { childList: true, subtree: true });
