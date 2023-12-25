import { redirect, type LoaderFunctionArgs } from "@remix-run/node";
import { generateState } from "arctic";
import { facebookAuthCookie } from "~/auth/cookie.server";
import { useFacebookAuth } from "~/auth/lucia.server";

export async function loader({ request }: LoaderFunctionArgs) {
	const state = generateState();
	const facebook = useFacebookAuth(request);
	const url = await facebook.createAuthorizationURL(state);
	return redirect(url.toString(), {
		headers: [["Set-Cookie", await facebookAuthCookie.serialize(state)]],
	});
}
