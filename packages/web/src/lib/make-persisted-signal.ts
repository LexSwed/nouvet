import { cache, createAsync, revalidate } from '@solidjs/router';
import { type Setter } from 'solid-js';
import { isServer } from 'solid-js/web';

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
function deserialize<T>(cookieString: unknown): T | null {
  if (typeof cookieString !== 'string' || cookieString === '') return null;

  return JSON.parse(decodeURIComponent(cookieString)) as T;
}
/* 
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
} */

const getServerSetting = async <T>(name: string) => {
  'use server';
  const { getCookie } = await import('vinxi/server');
  return deserialize<T>(getCookie(name));
};

const setting = cache(async <T>(name: string) => {
  if (isServer) {
    return getServerSetting<T>(name);
  }
  return deserialize<T>(parseCookies(document.cookie)[name]);
}, 'cookie-setting');

// eslint-disable-next-line @typescript-eslint/ban-types
export function makePersistedSetting<T, U extends Exclude<T, Function>>(
  name: string,
  // eslint-disable-next-line @typescript-eslint/ban-types
  defaultValue?: U,
) {
  const cookie = createAsync(async (): Promise<U | null> => {
    const stored = await setting<U>(name);
    return stored || defaultValue || null;
  });

  // @ts-expect-error what do you want from me
  const updateCookie: Setter<U> = (value) => {
    if (typeof value === 'function') {
      console.log(cookie);
      // @ts-expect-error what do you want from me
      const updated = value(cookie());
      document.cookie = `${name}=${serialize(updated)}`;
    } else {
      document.cookie = `${name}=${serialize(value)}`;
    }
    if (!document.startViewTransition) {
      revalidate(setting.keyFor(name));
      return;
    }
    document.startViewTransition(() => {
      revalidate(setting.keyFor(name));
    });
  };

  return [cookie, updateCookie] as const;
}
