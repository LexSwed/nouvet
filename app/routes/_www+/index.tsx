import { type MetaFunction } from "@remix-run/node";
import { useTranslation } from "react-i18next";
import i18n from "~/i18n/i18n.server.ts";
import { Link } from "@remix-run/react";
import { Button } from "~/lib/ui/button.tsx";
import { ArrowCircleUpRight } from "~/lib/icons/arrow-circle-up-right.tsx";

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
			<main className="container mt-12 flex flex-col gap-8">
				<section className="flex flex-col gap-8">
					<h1 className="text-3xl font-bold">{t("headline")}</h1>
					<h2 className="text-xl">{t("subheadline")}</h2>
					<Button
						asChild
						size="lg"
						className="flex items-center gap-4 self-start text-lg"
					>
						<Link to="/family">
							{t("cta-start")}{" "}
							<ArrowCircleUpRight className="h-6 w-6 shrink-0" />
						</Link>
					</Button>
				</section>
			</main>
		</div>
	);
}
