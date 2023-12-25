import { createCookie } from "@remix-run/node";
import {
	object,
	string,
	type BaseValidation,
	type ErrorMessage,
	actionIssue,
	actionOutput,
	picklist,
	type Output,
	parse,
} from "valibot";
import { acceptedLocales } from "~/i18n/shared";

const cookieSchema = object({
	locale: string("locale is empty", [validLocale()]),
	// timeZone: date(),
	measurementSystem: picklist(["imperial", "metrical"]),
});

type UserPreferencesSchema = Output<typeof cookieSchema>;

const userPreferencesCookie = createCookie("nouvet_user_preferences", {
	maxAge: 180 * 24 * 60 * 60,
	sameSite: "lax",
	secure: true,
	httpOnly: true,
});

/**
 * Returns user preferences from the cookie.
 * @throws {ValiError} if the cookie is not set, expired, or unsupported values are stored.
 */
export const getUserPreferences = async (
	request: Request,
): Promise<UserPreferencesSchema> => {
	const cookieString =
		(await userPreferencesCookie.parse(request.headers.get("Cookie"))) ?? "";
	return parse(cookieSchema, cookieString);
};

/**
 * Serializes user preferences to a cookie for 180 days if all the values are correct.
 * @throws {ValiError} if locale or measurements system is not supported.
 */
export const serializeUserPreferences = (
	preferences: UserPreferencesSchema,
) => {
	const parsed = parse(cookieSchema, preferences);
	return userPreferencesCookie.serialize(parsed);
};

export function validLocale<TInput extends string>(
	message: ErrorMessage = "Invalid Locale Tag",
): BaseValidation<TInput> & { type: "locale" } {
	return {
		type: "locale",
		async: false,
		message,
		_parse(input) {
			if (!input) return actionIssue(this.type, this.message, input);
			try {
				const locale = new Intl.Locale(input);
				return acceptedLocales.includes(
					locale.language as (typeof acceptedLocales)[number],
				)
					? actionOutput(input)
					: actionIssue(this.type, this.message, input);
			} catch {}

			return actionIssue(this.type, this.message, input);
		},
	};
}
