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

const checkBookPage = (): boolean => {
  const elem = document.getElementById('richProductInformation_feature_div');
  return elem !== null;
};

class RequestFromPopup {
  private readonly type: string;
  constructor(type: string) {
    this.type = type;
  }

  checkType(s: string): boolean {
    return s === this.type;
  }

  reply(content: string) {
    chrome.runtime.sendMessage({
      payload: {
        type: this.type,
        content: content,
      },
      isBook: checkBookPage(),
    });
  }
}

chrome.runtime.onMessage.addListener((request) => {
  if (document.readyState !== 'complete') {
    return;
  }

  const req = new RequestFromPopup(request.type);
  if (req.checkType('page-type-check')) {
    chrome.runtime.sendMessage({
      isBook: checkBookPage(),
    });
    return;
  }

  if (req.checkType('title')) {
    const content = document.getElementById('productTitle')?.innerText || '';
    req.reply(content);
    return;
  }

  if (req.checkType('detail')) {
    const content = document.querySelector<HTMLElement>(
      '#detailBullets_feature_div ul'
    )!.innerHTML;
    req.reply(content);
    return;
  }

  if (req.checkType('author-info')) {
    const content = getAuthorInfo().join('・');
    req.reply(content);
    return;
  }

  if (req.checkType('cover-image')) {
    req.reply(getCoverImageSrc());
    return;
  }
});
