import { createSignal, type Setter } from 'solid-js';
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

export function makePersistedSetting<T>(
  name: string,
  // eslint-disable-next-line @typescript-eslint/ban-types
  defaultValue?: Exclude<T, Function>,
) {
  const [cookie, setCookie] = createSignal<T | null>(
    deserialize<T>(name) || defaultValue || null,
  );

  // @ts-expect-error what do you want from me
  const updateCookie: Setter<T> = (value) => {
    if (typeof value === 'function') {
      setCookie((prev) => {
        // @ts-expect-error what do you want from me
        const updated = value(prev);
        document.cookie = `${name}=${serialize(updated)}`;
        return updated;
      });
    } else {
      document.cookie = `${name}=${serialize(value)}`;
      // @ts-expect-error what do you want from me
      setCookie(value);
    }
  };

  return [cookie, updateCookie] as const;
}
