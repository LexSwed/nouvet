"use server";

import { type RouterResponseInit, json } from "@solidjs/router";
import * as v from "valibot";
import type ErrorsDict from "~/server/i18n/locales/en/errors";

import { Temporal } from "temporal-polyfill";
import type { SubmissionError } from "~/lib/utils/submission";
import { getDictionary } from "./i18n/dict";

type FlatErrorsTranslation<
	TSchema extends
		| v.BaseSchema<unknown, unknown, v.BaseIssue<unknown>>
		| v.BaseSchemaAsync<unknown, unknown, v.BaseIssue<unknown>>,
> = Partial<Record<keyof v.InferInput<TSchema>, string>>;

export async function translateErrorTokens<
	TSchema extends
		| v.BaseSchema<unknown, unknown, v.BaseIssue<unknown>>
		| v.BaseSchemaAsync<unknown, unknown, v.BaseIssue<unknown>>,
>(error: v.ValiError<TSchema>) {
	const t = await getDictionary("errors");
	const flat: FlatErrorsTranslation<TSchema> = {};
	for (const [key, issue] of Object.entries(v.flatten(error.issues).nested ?? {})) {
		const errorKey = issue?.at(0);
		if (errorKey) {
			flat[key as keyof FlatErrorsTranslation<TSchema>] =
				errorKey in t ? t[errorKey as keyof typeof t] : errorKey;
		}
	}
	return flat;
}

export type ErrorKeys = keyof typeof ErrorsDict;

export async function timeout(ms: number) {
	await new Promise((resolve) => setTimeout(resolve, ms));
}

export async function jsonFailure<
	TSchema extends
		| v.BaseSchema<unknown, unknown, v.BaseIssue<unknown>>
		| v.BaseSchemaAsync<unknown, unknown, v.BaseIssue<unknown>>,
>(error: Error | unknown, init?: RouterResponseInit) {
	if (v.isValiError<TSchema>(error)) {
		return json(
			{
				failureReason: "validation",
				errors: await translateErrorTokens(error),
			} satisfies SubmissionError<"validation">,
			{
				status: 422,
				revalidate: [],
				...init,
			},
		);
	}
	console.error(error);

	return json({ failureReason: "other" } satisfies SubmissionError<"other">, {
		status: 500,
		revalidate: [],
		...init,
	});
}

export function getCurrentZonedDateTime(timeZoneId: string) {
	return Temporal.Now.zonedDateTimeISO(timeZoneId);
}
