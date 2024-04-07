import { cache, createAsync, revalidate } from '@solidjs/router';
import { type Accessor, type Setter } from 'solid-js';
import { isServer } from 'solid-js/web';

const parseDocumentCookie = () =>
  Object.fromEntries(
    document.cookie
      .split(';')
      .map((cookie) => (cookie ? cookie.trim().split('=') : [])),
  );

function serialize<T>(value: T): string {
  if (typeof value === 'object') {
    return encodeURIComponent(JSON.stringify(value));
  }
  return value === undefined ? '' : encodeURIComponent(`${value}`);
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

type PersistedSettingParams = {
  maxAgeInDays?: number;
};

export function createPersistedSetting<
  T extends
    | Record<string, string | number | undefined | null | boolean>
    | string
    | number
    | boolean,
>(
  name: string,
  defaultValue: T,
  params?: PersistedSettingParams,
): [Accessor<T | null | undefined>, Setter<T>] {
  const cookie = createAsync(async (): Promise<T | null> => {
    const stored = await setting<T>(name);
    return stored ?? defaultValue ?? null;
  });

  // @ts-expect-error what do you want from me
  const updateCookie: Setter<T> = (value) => {
    // @ts-expect-error what do you want from me
    const newValue: T = typeof value === 'function' ? value(cookie()) : value;

    document.cookie = `${name}=${serialize(newValue)};max-age=${60 * 60 * 24 * (params?.maxAgeInDays ?? 180)}`;
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
