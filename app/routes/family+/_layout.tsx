import { Outlet, type MetaFunction } from "@remix-run/react";
// import i18next from "~/i18n/i18next.server.ts";

export const meta: MetaFunction = (ctx) => {
	return [
		{ title: "NouVet" },
		// {
		// 	name: "description",
		// 	content: i18next.getFixedT(request, "headline", { ns: "www" }),
		// },
	];
};

export default function FamilyRoute() {
	return (
		<div className="container">
			This root page is the main hub for authenticated family content.
			<Outlet />
		</div>
	);
}
