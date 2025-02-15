import { isNull, isNumber } from 'lodash';

export function isNotBlank(str: string | undefined | null): str is string {
  return !!(str && str.trim() !== '');
}

export function isBlank(str: string | undefined | null): str is '' {
  return !isNotBlank(str);
}

export function isValidUsername(name: string) {
  // check length
  if (name.length < 2 || name.length > 20) {
    return false;
  }
  // regular expression for username validation
  var regex = /^[^.][a-z0-9.]*[^.]$/i;
  // check invalid characters
  if (/[\&\*\?=_'"“‘,,+\-<>]/.test(name)) {
    return false;
  }
  // check consecutive periods
  if (/\.{2,}/.test(name)) {
    return false;
  }
  // check against regular expression
  if (!regex.test(name)) {
    return false;
  }
  return true;
}

export function isValidEmail(email: string) {
  const pattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return pattern.test(email);
}

export function isValidPassword(password: string) {
  return (
    password.length >= 6 &&
    password.length <= 20 &&
    /\d/.test(password) &&
    /[a-zA-Z]/.test(password)
  );
}

export function isValidHttpHRL(url: string) {
  const pattern = /^(http|https):\/\/[^ "]+$/;
  return pattern.test(url);
}
