import type { useSubmission } from "@solidjs/router";

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
type Submission<T extends any[], U> = ReturnType<typeof useSubmission<T, U>>;
// biome-ignore lint/suspicious/noExplicitAny: <explanation>
export type SubmissionResult<S> = S extends Submission<any, infer U> ? U : never;

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
type ValidationError<Errors = any> = { failureReason: "validation"; errors: Errors };
type GenericError = { failureReason: "other" };
// biome-ignore lint/suspicious/noExplicitAny: <explanation>
export type SubmissionError<R extends "validation" | "other", E = any> = R extends "validation"
	? ValidationError<E>
	: GenericError;

type AnyOrSubmissionError<
	R extends "validation" | "other",
	Errors = any,
	U = unknown,
> = U extends SubmissionError<R, Errors>
	? Extract<U, SubmissionError<R, Errors>>
	: // biome-ignore lint/suspicious/noExplicitAny: <explanation>
		Exclude<U, { failureReason: any }>;

export function isSubmissionFailure<
	Reason extends "validation" | "other",
	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	S extends Submission<any[], AnyOrSubmissionError<Reason, Errors>>,
	Errors,
>(
	submission: S,
	reason: Reason,
): submission is S & { result: Extract<SubmissionResult<S>, SubmissionError<Reason, Errors>> } {
	return !!(
		typeof submission.result === "object" &&
		submission.result !== null &&
		"failureReason" in submission.result &&
		submission.result.failureReason === reason
	);
}

export function isSubmissionValidationError<
	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	S extends Submission<any[], AnyOrSubmissionError<"validation", Errors>>,
	Errors,
>(submission: S) {
	return isSubmissionFailure(submission, "validation");
}

export function pickSubmissionValidationErrors<
	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	S extends Submission<any[], AnyOrSubmissionError<"validation", Errors>>,
	Errors,
>(submission: S) {
	return isSubmissionValidationError(submission) ? submission.result.errors : null;
}

export function isSubmissionGenericError<
	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	S extends Submission<any[], AnyOrSubmissionError<"other">>,
>(submission: S) {
	return isSubmissionFailure(submission, "other");
}

export function isSubmissionSuccess<
	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	S extends Submission<any[], any>,
>(
	submission: S,
	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
): submission is S & { result: Exclude<SubmissionResult<S>, { failureReason: any } | undefined> } {
	return (
		typeof submission.result === "object" &&
		submission.result !== null &&
		!("failureReason" in submission.result)
	);
}
