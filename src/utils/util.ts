import { IPromptDef } from 'intellichat/types';
import { isArray, isNull } from 'lodash';

export function date2unix(date: Date) {
  return Math.floor(date.getTime() / 1000);
}

export function unix2date(unix: number) {
  return new Date(unix * 1000);
}

export function isTagClosed(code: string, tag: string) {
  if (!code || code.trim() === '') return true;
  if (!tag || tag.trim() === '') return true;
  const openRegex = new RegExp(`<${tag}>`, 'g');
  const closeRegex = new RegExp(`</${tag}>`, 'g');
  const openMatched = code.match(openRegex) || [];
  const closeMatched = code.match(closeRegex) || [];
  return openMatched.length === closeMatched.length;
}

export function str2int(str: string, defaultValue: number | null = null) {
  const result = parseInt(str, 10);
  if (Number.isNaN(result)) {
    return defaultValue;
  }
  return result;
}

export function fmtDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}/${month}/${day}`;
}

export function fmtDateTime(date: Date) {
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `${fmtDate(date)} ${hours}:${minutes}:${seconds}`;
}

export function highlight(text: string, keyword: string) {
  if (!keyword || keyword.trim() === '') return text;
  const regex = new RegExp(keyword.trim(), 'gi');
  return text.replace(regex, (match) => `<mark>${match}</mark>`);
}

export function parseVariables(text: string): string[] {
  const regex = /\{\{([^}]+)\}\}/g;
  const variables: string[] = [];
  let m = regex.exec(text);
  while (m) {
    const variable = m[1].trim();
    if (variable !== '' && !variables.includes(variable)) {
      variables.push(variable);
    }
    variables.push();
    m = regex.exec(text);
  }
  return variables;
}

export function fillVariables(
  text: string,
  variables: { [key: string]: string }
) {
  let result = text;
  Object.keys(variables).forEach((key) => {
    const regex = new RegExp(`{{${key}}}`, 'g');
    result = result.replace(regex, variables[key]);
  });
  return result;
}
export function sortPrompts(prompts: IPromptDef[]) {
  if (!isArray || prompts.length === 0) {
    return [];
  }
  return prompts.sort((a: IPromptDef, b: IPromptDef) => {
    if (isNull(a.pinedAt) && isNull(b.pinedAt)) {
      return a.createdAt - b.createdAt;
    }
    if (a.pinedAt && isNull(b.pinedAt)) {
      return -1 || a.createdAt - b.createdAt;
    }
    if (b.pinedAt && isNull(a.pinedAt)) {
      return 1 || a.createdAt - b.createdAt;
    }
    return (
      (b.pinedAt as number) - (a.pinedAt as number) || a.createdAt - b.createdAt
    );
  });
}

export function insertAtCursor(field: HTMLDivElement, value: string) {
  field.focus();
  let selection = window.getSelection();
  if (selection && selection.rangeCount > 0) {
    const range = selection.getRangeAt(0);
    const node = document.createRange().createContextualFragment(value);
    range.insertNode(node);
  } else {
    field.innerText = field.innerHTML + value;
    setCursorToEnd(field);
  }
  return field.innerHTML;
}

export function setCursorToEnd(field: HTMLDivElement) {
  const range = document.createRange();
  const selection = window.getSelection();
  if (selection) {
    range.selectNodeContents(field);
    range.collapse(false); // false means collapse to end
    selection.removeAllRanges();
    selection.addRange(range);
  }
}

export function isGPT35(model: string) {
  return (
    model.toLowerCase().startsWith('gpt-3.5') ||
    model.toLowerCase().startsWith('gpt-35')
  );
}

export function isGPT4(model: string) {
  return model.toLowerCase().startsWith('gpt-4');
}

export function isGPT(model: string) {
  return isGPT35(model) || isGPT4(model);
}

export function isDoubao(model:string){
  return model.toLowerCase().startsWith('doubao')
}

export function isClaude1(model: string) {
  return model.toLowerCase() === 'claude-instant-1';
}

export function isClaude2(model: string) {
  return model.toLowerCase() === 'claude-2';
}

export function isClaude(model: string) {
  return isClaude1(model) || isClaude2(model);
}

export function isGemini(model: string) {
  return model.toLowerCase().startsWith('gemini');
}

export function isMoonshot(model: string) {
  return model.toLowerCase().startsWith('moonshot');
}

export function isLlama(model: string) {
  return model.toLowerCase().startsWith('llama');
}

export function tryAgain(callback: () => any, times = 3, delay = 1000) {
  let tryTimes = 0;
  const interval = setInterval(() => {
    tryTimes += 1;
    if (tryTimes > times) {
      clearInterval(interval);
    }
    try {
      if (callback()) {
        clearInterval(interval);
      }
    } catch (e) {
      console.log(e);
    }
  }, delay);
}

export function raiseError(status: number, response: any, message?: string) {
  /**
   * Azure will return resposne like follow
   * {
   *   "error": {
   *     "message": "...",
   *     "type": "invalid_request_error",
   *     "param": "messages",
   *     "code": "context_length_exceeded"
   *   }
   * }
   */
  let resp = Array.isArray(response) ? response[0] : response;
  const msg = resp?.error?.message || message;
  switch (status) {
    case 400:
      throw new Error(msg || 'Bad request');
    case 401:
      throw new Error(
        msg ||
          'Invalid authentication, please ensure the API key used is correct'
      );
    case 403:
      throw new Error(
        msg ||
          'Permission denied, please confirm your authority before try again.'
      );
    case 404:
      new Error(msg || 'Not found');
    case 409:
      new Error(msg || 'Conflict');
    case 429:
      new Error(
        msg ||
          'Rate limit reached for requests, or you exceeded your current quota.'
      );
    case 500:
      throw new Error(
        msg || 'The server had an error while processing your request'
      );
    case 503:
      throw new Error(
        msg || 'The engine is currently overloaded, please try again later'
      );
    default:
      throw new Error(msg || 'Unknown error');
  }
}

export function arrayBufferToBase64(buffer: ArrayBuffer) {
  var binary = '';
  var bytes = new Uint8Array(buffer);
  var len = bytes.byteLength;
  for (var i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

export async function getBase64(url: string): Promise<string> {
  const resp = await fetch(url);
  return arrayBufferToBase64(await resp.arrayBuffer());
}

export function removeTagsExceptImg(html: string): string {
  // 使用正则表达式移除除 <img> 以外的所有标签
  return html.replace(/<(?!img\b)[^>]*>/gi, '');
}

export function stripHtmlTags(html: string): string {
  return html.replace(/<[^>]*>/g, '');
}

export function splitByImg(html: string, base64Only: boolean = false) {
  const mimeTypes: { [key: string]: string } = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.bmp': 'image/bmp',
    '.webp': 'image/webp',
    '.heic': 'image/heic',
    '.heif': 'image/heif',
  };
  const splitRegex = base64Only
    ? /(<img\s+src="data:[^"]+"\s*.*\/?>)/g
    : /(<img\s+src="[^"]+"\s*.*\/?>)/g;
  const srcRegex = base64Only
    ? /<img\s+src="(data:[^"]+)"\s*.*\/?>/g
    : /<img\s+src="([^"]+)"\s*.*\/?>/g;
  const items = html
    .split(splitRegex)
    .map((item) => item.trim())
    .filter((item: string) => item !== '');
  return items.map((item: string) => {
    const matches = item.match(srcRegex);
    if (matches) {
      let data = matches.map((match) => match.replace(srcRegex, '$1'))[0];
      const dataType = data.startsWith('data:') ? 'base64' : 'URL';
      let mimeType = 'unknown';
      if (dataType === 'base64') {
        mimeType = data.split(';')[0].split(':')[1];
      } else {
        const ext = '.' + data.split('.').pop()?.toLowerCase();
        mimeType = ext ? mimeTypes[ext] || 'unknown' : 'unknown';
      }
      return {
        type: 'image',
        dataType,
        mimeType,
        data,
      };
    }
    return {
      type: 'text',
      data: item,
    };
  });
}

export function paddingZero(num: number, length: number) {
  return (Array(length).join('0') + num).slice(-length);
}

export function fileSize(sizeInBytes: number) {
  const i = Math.floor(Math.log(sizeInBytes) / Math.log(1024));
  return (
    (sizeInBytes / Math.pow(1024, i)).toFixed(1) +
    ['B', 'KB', 'MB', 'GB', 'TB'][i]
  );
}

export function isOneDimensionalArray(arr: any[]): boolean {
  if (!isArray(arr)) {
    throw new Error('Input is not an array.');
  }
  for (let item of arr) {
    if (isArray(item)) {
      return false; // It is a two-dimensional array
    }
  }
  return true;
}

export function extractCitationIds(text: string): string[] {
  const regex = /\[\(?\d+\)?\]\(citation#([a-z0-9]+)\s*".*?"\)/g;
  // 使用matchAll返回所有匹配结果
  const matches = text.matchAll(regex);
  return [...matches].map((match) => match[1]);
}
