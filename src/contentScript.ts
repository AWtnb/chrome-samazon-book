'use strict';

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
  return elem.getAttribute('data-old-hires') || '';
};

const sendRuntimeMessage = (type: string, payload: string) => {
  chrome.runtime.sendMessage({
    type: type,
    payload: payload,
  });
};

export class Request {
  private _type: string;
  private _payload: string;
  constructor(type: string, payload: string) {
    this._type = type;
    this._payload = payload;
  }
  get type(): string {
    return this._type;
  }
  get payload(): string {
    return this._payload;
  }
  replyWith(payload: string) {
    sendRuntimeMessage(this._type, payload);
  }
}

chrome.runtime.onMessage.addListener((request) => {
  if (!request.type || request.payload !== 'greeting-for-tab') {
    return;
  }
  if (document.readyState !== 'complete') {
    return;
  }

  const req = new Request(request.type, request.payload);

  if (req.type === 'page-type-check') {
    const payload = checkBookPage() ? 'book-page' : 'non-book-page';
    sendRuntimeMessage('page-type-answer', payload);
    return;
  }

  if (req.type === 'search-info') {
    const title = getBookTitle();
    const publisher = getPublisher();
    const content = publisher + ' ' + title;
    req.replyWith(content);
    return;
  }

  if (req.type === 'title') {
    const content = getBookTitle();
    req.replyWith(content);
    return;
  }

  if (req.type === 'detail') {
    const elem = getDetailListElem();
    if (!elem) {
      return '';
    }
    const content = elem.innerHTML;
    req.replyWith(content);
    return;
  }

  if (req.type === 'author-info') {
    const content = getAuthorInfo().join('・');
    req.replyWith(content);
    return;
  }

  if (req.type === 'cover-image') {
    const content = getCoverImageSrc();
    req.replyWith(content);
    return;
  }
});
