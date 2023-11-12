import { type MetaFunction } from "@remix-run/node";
import { Trans, useTranslation } from "react-i18next";
import i18n from "~/i18n/i18n.server.ts";

export const meta: MetaFunction = () => {
	return [
		{ title: "NouVet" },
		{
			name: "description",
			content: i18n.t("Human routine for pets", { ns: "www" }),
		},
	];
};

export default function IndexRoute() {
	const { t } = useTranslation();
	return (
		<div className="container">
			<header>
				<h1 className="text-3xl">
					<Trans ns="www">Human routine for pets</Trans>
				</h1>
			</header>
			<ul>
				<li>
					<a
						target="_blank"
						href="https://remix.run/tutorials/blog"
						rel="noreferrer"
					>
						{t("greeting")}
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
