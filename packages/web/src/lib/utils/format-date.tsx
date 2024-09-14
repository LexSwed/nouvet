import { createAsync } from "@solidjs/router";
import { type Accessor, createMemo } from "solid-js";
import { Temporal } from "temporal-polyfill";

import { getUser } from "~/server/api/user";
import type { SupportedLocale } from "~/server/i18n/shared";

/**
 * Formats date using user's locale.
 * Make sure the date string is in Unix or ISO format.
 */
export function createFormattedDate(
	date: Accessor<Date | Temporal.ZonedDateTime | undefined>,
	locale: Accessor<SupportedLocale | undefined>,
	options: Intl.DateTimeFormatOptions = {},
) {
	const formatted = createMemo(() => {
		const d = date();
		if (d && locale()) {
			const formatter = new Intl.DateTimeFormat(locale(), {
				month: options.month ?? "long",
				day: options.day ?? "numeric",
				hour: options.hour ?? "numeric",
				minute: options.minute ?? "numeric",
				year: options.year,
			});
			return formatter.format(
				d instanceof Temporal.ZonedDateTime ? new Date(d.epochMilliseconds) : d,
			);
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
