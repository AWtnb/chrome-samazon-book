export enum PopupInfo {
  'PageTypeCheck' = 'page-type-check',
  'Title' = 'title',
  'Detail' = 'detail',
  'AuthorInfo' = 'author-info',
  'CoverImage' = 'cover-image',
  'SearchInfo' = 'search-info',
}

export enum ContentInfo {
  'PageTypeAnswer' = 'page-type-answer',
  'BookPage' = 'book-page',
  'NonBookPage' = 'non-book-page',
}

export enum BackgroundInfo {
  'CheckForIcon' = 'check-for-icon',
  'AnswerForIcon' = 'answer-for-icon',
}

export const requestToContentScript = (requestName: string) => {
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

export enum MessageTo {
  'popup' = 'popup',
  'content' = 'content',
  'background' = 'background',
}

export const sendRuntimeMessage = (
  to: MessageTo,
  type: string,
  payload: string
) => {
  chrome.runtime.sendMessage({
    to: to,
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
    sendRuntimeMessage(MessageTo.popup, this._type, payload);
  }
}
