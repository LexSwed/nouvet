import { cache, createAsync, revalidate } from "@solidjs/router";
import { untrack } from "solid-js";
import { isServer } from "solid-js/web";

import { startViewTransition } from "./start-view-transition";

const parseDocumentCookie = () =>
	Object.fromEntries(
		document.cookie.split(";").map((cookie) => (cookie ? cookie.trim().split("=") : [])),
	);

function serialize<T>(value: T): string {
	if (typeof value === "object") {
		return encodeURIComponent(JSON.stringify(value));
	}
	return value === undefined ? "" : encodeURIComponent(`${value}`);
}
function deserialize(cookieString: unknown) {
	if (typeof cookieString !== "string" || cookieString === "") return null;

	return JSON.parse(decodeURIComponent(cookieString));
}

const getServerSetting = async (name: string) => {
	"use server";
	const { getCookie } = await import("vinxi/server");
	return deserialize(getCookie(name));
};

const setting = cache(async (name: string) => {
	if (isServer) {
		return getServerSetting(name);
	}
	return deserialize(parseDocumentCookie()[name]);
}, "cookie-setting");

type PersistedSettingParams = {
	maxAgeInDays?: number;
};

export function createPersistedSetting<
	T extends
		| Record<string, string | number | undefined | null | boolean>
		| string
		| number
		| boolean,
>(name: string, defaultValue: T, params?: PersistedSettingParams) {
	const cookie = createAsync(async () => {
		const stored = await setting(name);
		return (stored as T) ?? defaultValue;
	});

	const updateCookie = (value: T | ((oldValue: T) => T)) =>
		untrack(() => {
			const newValue: T = typeof value === "function" ? value(cookie() as T) : value;

			document.cookie = `${name}=${serialize(newValue)};max-age=${60 * 60 * 24 * (params?.maxAgeInDays ?? 180)}`;
			startViewTransition(() => {
				revalidate(setting.keyFor(name));
			});
		});

	return [cookie, updateCookie] as const;
}
