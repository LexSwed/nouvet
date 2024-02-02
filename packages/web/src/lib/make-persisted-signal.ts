import { createEffect, createSignal } from 'solid-js';
import { getRequestEvent, isServer } from 'solid-js/web';
import { getCookie } from 'vinxi/server';

const parseCookies = (str: string) =>
  Object.fromEntries(
    str.split(';').map((cookie) => (cookie ? cookie.split('=') : [])),
  );

function serialize<T>(value: T): string {
  if (value && typeof value === 'object') {
    return encodeURIComponent(JSON.stringify(value));
  }
  return value ? encodeURIComponent(`${value}`) : '';
}
function deserialize<T>(name: string): T | null {
  let string: string;
  if (isServer) {
    string = getCookie(getRequestEvent()!, name) || '';
    if (!string) return null;
  } else {
    string = parseCookies(document.cookie)[name] || '';
    if (!string) return null;
  }
  if (!string || string === '') return null;

  return JSON.parse(decodeURIComponent(string)) as T;
}

export function makePersistedSetting<T>(name: string, defaultValue?: T) {
  const [cookie, setCookie] = createSignal<T | null>(
    deserialize<T>(
      isServer
        ? getCookie(getRequestEvent()!, name)
        : parseCookies(document.cookie)[name],
    ) ||
      defaultValue ||
      null,
  );

  createEffect(() => {
    document.cookie = `${name}=${serialize(cookie())}`;
  });

  return [cookie, setCookie] as const;
}
