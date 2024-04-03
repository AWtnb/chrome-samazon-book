'use strict';

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
    chrome.runtime.sendMessage({
      type: this._type,
      payload: payload,
    });
  }
}

chrome.runtime.onMessage.addListener((request) => {
  if (!request.type || !request.payload) {
    return;
  }
  if (document.readyState !== 'complete') {
    return;
  }

  const req = new Request(request.type, request.payload);

  if (req.type === 'page-type-check') {
    const elem = document.getElementById('richProductInformation_feature_div');
    const payload = elem ? 'book-page' : 'non-book-page';
    chrome.runtime.sendMessage({
      type: 'page-type-answer',
      payload: payload,
    });
    return;
  }

  if (req.type === 'title') {
    const content = document.getElementById('productTitle')?.innerText || '';
    req.replyWith(content);
    return;
  }

  if (req.type === 'detail') {
    const content = document.querySelector<HTMLElement>(
      '#detailBullets_feature_div ul'
    )!.innerHTML;
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
