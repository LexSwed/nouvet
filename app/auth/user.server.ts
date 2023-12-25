import { redirect } from "@remix-run/node";
import { returnUrlCookie, userCookie } from "./cookie.server";
import type { User } from "lucia";

export async function getRequestUser(request: Request): Promise<User> {
	const cookie = request.headers.get("Cookie") || "";
	const user = await userCookie.parse(cookie);
	if (!user) {
		const { pathname } = new URL(request.url);
		throw redirect("/app/login", {
			headers: [["Set-Cookie", await returnUrlCookie.serialize(pathname)]],
		});
	}
	return user;
}
