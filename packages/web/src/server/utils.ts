"use server";

import * as v from "valibot";

import type ErrorsDict from "~/server/i18n/locales/en/errors";

import { getDictionary } from "./i18n/dict";

export async function translateErrorTokens<
	TSchema extends
		| v.BaseSchema<unknown, unknown, v.BaseIssue<unknown>>
		| v.BaseSchemaAsync<unknown, unknown, v.BaseIssue<unknown>>,
>(error: v.ValiError<TSchema>): Promise<Partial<Record<keyof TSchema, string>>> {
	const t = await getDictionary("errors");
	const flat: Partial<Record<keyof TSchema, string>> = {};
	for (const [key, issue] of Object.entries(v.flatten(error.issues).nested ?? {})) {
		if (issue) {
			// @ts-expect-error I know what I'm doing
			flat[key] =
				issue[0] in t
					? // @ts-expect-error I know what I'm doing
						t[`${issue[0]}`]
					: issue[0];
		}
	}
	return flat;
}

export type ErrorKeys = keyof typeof ErrorsDict;

export async function timeout(ms: number) {
	await new Promise((resolve) => setTimeout(resolve, ms));
}
