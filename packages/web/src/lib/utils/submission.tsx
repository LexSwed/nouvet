import { type RouterResponseInit, json, type useSubmission } from "@solidjs/router";

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
type Submission<T extends any[], U> = ReturnType<typeof useSubmission<T, U>>;
// biome-ignore lint/suspicious/noExplicitAny: <explanation>
export type SubmissionResult<S> = S extends Submission<any, infer U> ? U : never;

export function isSubmissionFailure<
	R extends "validation" | "other",
	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	S extends Submission<any, any>,
>(
	submission: S,
	reason: R,
): submission is S & { result: Extract<SubmissionResult<S>, { failureReason: R }> } {
	return (
		submission.result &&
		"failureReason" in submission.result &&
		submission.result.failureReason === reason
	);
}

export function isSubmissionSuccess<
	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	S extends Submission<any, any>,
>(
	submission: S,
	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
): submission is S & { result: Exclude<SubmissionResult<S>, { failureReason: any }> } {
	return submission !== undefined && !("failureReason" in submission);
}

export function jsonFailure<R extends "validation" | "other", T>(
	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	data: T & (R extends "validation" ? { failureReason: R; errors: any } : { failureReason: R }),
	init?: RouterResponseInit,
) {
	return json(data, {
		status: data.failureReason === "validation" ? 422 : 500,
		revalidate: [],
		...init,
	});
}
