import { type MetaFunction } from "@remix-run/node";
import { useTranslation } from "react-i18next";
import i18n from "~/i18n/i18n.server.ts";
import { Link } from "@remix-run/react";
import { Button } from "~/lib/ui/button.tsx";

export const meta: MetaFunction = () => {
	return [
		{ title: "NouVet" },
		{
			name: "description",
			content: i18n.t("headline", { ns: "www" }),
		},
	];
};

export default function IndexRoute() {
	const { t } = useTranslation("www");
	return (
		<div className="bg-main min-h-full pb-8 pt-4">
			<header className="container flex flex-row items-center justify-between ">
				<a href="block" title={t("link-home")} className="-m-4 p-4">
					<img src={"/icons/icon.svg"} className="h-12 w-12" />
				</a>
				<Button asChild>
					<Link to="/family">{t("open-family-app")}</Link>
				</Button>
			</header>
			<ul>
				<li>
					<a
						target="_blank"
						href="https://remix.run/tutorials/blog"
						rel="noreferrer"
					>
						{t("headline")}
					</a>
				</li>
				<li>
					<a
						target="_blank"
						href="https://remix.run/tutorials/jokes"
						rel="noreferrer"
					>
						Deep Dive Jokes App Tutorial
					</a>
				</li>
				<li>
					<a target="_blank" href="https://remix.run/docs" rel="noreferrer">
						Remix Docs
					</a>
				</li>
			</ul>
		</div>
	);
}
