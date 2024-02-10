import { cache, createAsync, revalidate } from '@solidjs/router';
import { type Setter } from 'solid-js';
import { isServer } from 'solid-js/web';

const parseDocumentCookie = () =>
  Object.fromEntries(
    document.cookie
      .split(';')
      .map((cookie) => (cookie ? cookie.trim().split('=') : [])),
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

const getServerSetting = async <T>(name: string) => {
  'use server';
  const { getCookie } = await import('vinxi/server');
  return deserialize<T>(getCookie(name));
};

const setting = cache(async <T>(name: string) => {
  if (isServer) {
    return getServerSetting<T>(name);
  }
  return deserialize<T>(parseDocumentCookie()[name]);
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
    // @ts-expect-error what do you want from me
    const newValue: U = typeof value === 'function' ? value(cookie()) : value;

    document.cookie = `${name}=${serialize(newValue)};max-age=${60 * 60 * 24 * 365}`;
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
