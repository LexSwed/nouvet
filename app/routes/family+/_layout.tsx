import { Outlet, type MetaFunction } from "@remix-run/react";
import i18n from "~/i18n/i18n.server.ts";

export const meta: MetaFunction = () => {
	return [
		{ title: "NouVet" },
		{
			name: "description",
			content: i18n.t("headline", { ns: "www" }),
		},
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
