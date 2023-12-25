import type { LoaderFunctionArgs } from "@remix-run/node";
import { json, useLoaderData } from "@remix-run/react";
import { getRequestUser } from "~/auth/cookie.server";

export async function loader({ request }: LoaderFunctionArgs) {
	const user = await getRequestUser(request);
	return json({ user });
}

const AppMainPage = () => {
	const { user } = useLoaderData<typeof loader>();
	return <div>Hello, {user.id}</div>;
};

export default AppMainPage;
