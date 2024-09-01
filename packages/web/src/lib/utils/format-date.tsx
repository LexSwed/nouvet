import { createAsync } from "@solidjs/router";
import { type Accessor, createMemo } from "solid-js";

import { getUser } from "~/server/api/user";
import type { SupportedLocale } from "~/server/i18n/shared";

/**
 * Formats date using user's locale.
 * Make sure the date string is in Unix or ISO format.
 */
export function createFormattedDate(
	date: Accessor<Date | undefined>,
	locale: Accessor<SupportedLocale | undefined>,
	options: Intl.DateTimeFormatOptions = {
		month: "long",
		day: "numeric",
		hour: "numeric",
		minute: "numeric",
	},
) {
	const formatted = createMemo(() => {
		if (date() && locale()) {
			const formatter = new Intl.DateTimeFormat(locale(), options);
			return formatter.format(date());
		}
		return undefined;
	});

	return formatted;
}

/**
 * Formats date using user's locale.
 * Make sure the date string is in Unix or ISO format.
 */
export function createRelativeTimeFormat(
	[date, unit]: [date: Accessor<number | undefined>, unit: Intl.RelativeTimeFormatUnit],
	options: Intl.RelativeTimeFormatOptions = {
		style: "long",
		numeric: "auto",
	},
) {
	const user = createAsync(() => getUser());
	const formatted = createMemo(() => {
		const value = date();
		if (user() && value !== undefined) {
			const formatter = new Intl.RelativeTimeFormat(user()?.locale, options);
			return formatter.format(value, unit);
		}
		return undefined;
	});

	return formatted;
}
