import type { useSubmission } from "@solidjs/router";

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
type Submission<T extends any[], U> = ReturnType<typeof useSubmission<T, U>>;
// biome-ignore lint/suspicious/noExplicitAny: <explanation>
export type SubmissionResult<S> = S extends Submission<any, infer U> ? U : never;

type ValidationError = { failureReason: "validation"; errors: unknown };
type GenericError = { failureReason: "other" };
export type SubmissionError = ValidationError | GenericError;

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

export function isSubmissionValidationError<
	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	S extends Submission<any, any>,
>(submission: S): submission is S & { result: Extract<SubmissionResult<S>, ValidationError> } {
	return (
		submission.result &&
		"failureReason" in submission.result &&
		submission.result.failureReason === "validation"
	);
}

export function isSubmissionGenericError<
	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	S extends Submission<any, any>,
>(submission: S): submission is S & { result: Extract<SubmissionResult<S>, GenericError> } {
	return (
		submission.result &&
		"failureReason" in submission.result &&
		submission.result.failureReason === "other"
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
