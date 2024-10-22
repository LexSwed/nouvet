import { generateState } from "arctic";
import { sendRedirect } from "vinxi/http";

import { setFacebookOAuthStateCookie, useFacebookAuth } from "./_shared";

export const GET = () => {
	const state = generateState();
	const facebook = useFacebookAuth();
	const url = facebook.createAuthorizationURL(state, []);

	setFacebookOAuthStateCookie(state);

	return sendRedirect(url.toString());
};
