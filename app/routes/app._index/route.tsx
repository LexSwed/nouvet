import type { LoaderFunctionArgs } from "@remix-run/node";
import { json, useLoaderData } from "@remix-run/react";
import { getRequestUser } from "~/auth/user.server";

export async function loader({ request }: LoaderFunctionArgs) {
	const user = await getRequestUser(request);
	console.log("user", user);
	return json({ user });
}

const AppMainPage = () => {
	const { user } = useLoaderData<typeof loader>();
	return <div>Hello, {user.id}</div>;
};

export default AppMainPage;
