"use server";

import { deleteCookie, getCookie, getEvent } from "vinxi/http";

import { createUserSession } from "~/server/auth/user-session";
import { RETURN_URL_COOKIE } from "~/server/const";
import { env } from "../env";

async function loginDev(name: string) {
	let returnUrl = getCookie(RETURN_URL_COOKIE);

	if (returnUrl) {
		deleteCookie(RETURN_URL_COOKIE);
	}

	switch (returnUrl) {
		case "/":
		case "/app/login":
		case "/app/logout":
			returnUrl = "/app";
			break;
	}
	try {
		const event = getEvent();
		await createUserSession(event, {
			userId: name,
			locale: "en-GB",
			timeZoneId: "Europe/London",
			measurementSystem: "metrical",
		});

		return { redirectUrl: returnUrl || "/app" };
	} catch (error) {
		console.error(error);
		throw error;
	}
}

let loginDevServer: typeof loginDev;

if (!env.PROD) {
	loginDevServer = loginDev;
} else {
	throw new Error("LoginDev should not be used in Production");
}

export { loginDevServer };
