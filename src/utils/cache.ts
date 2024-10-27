function cacheKey(key: string) {
  return `__cache__${key}`;
}

export default {
  // default expiration is 1 hour
  set(key: string, value: any, expiration = 3600000) {
    const item = {
      value: value,
      expiration: Date.now() + expiration,
    };
    localStorage.setItem(cacheKey(key), JSON.stringify(item));
  },

  get(key: string) {
    const itemStr = localStorage.getItem(key);
    if (!itemStr) {
      return null;
    }

    const item = JSON.parse(itemStr);
    if (Date.now() > item.expiration) {
      localStorage.removeItem(key);
      return null;
    }

    return item.value;
  },

  remove(key: string) {
    localStorage.removeItem(cacheKey(key));
  },

  clear() {
    const keys = Object.keys(localStorage);
    for (let i = 0; i < keys.length; i++) {
      if (keys[i].startsWith('__cache__')) {
        localStorage.removeItem(keys[i]);
      }
    }
  },
};
