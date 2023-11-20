import { type MetaFunction } from "@remix-run/node";
import { useTranslation } from "react-i18next";
import i18n from "~/i18n/i18n.ts";
import { Link } from "@remix-run/react";
import { Button } from "~/lib/ui/button.tsx";
import { Icon } from "~/lib/icons/icon.tsx";

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
		<section className="flex flex-col gap-12">
			<div className="flex flex-col gap-6">
				<h1 className="text-3xl font-bold">{t("headline")}</h1>
				<h2 className="text-xl">{t("subheadline")}</h2>
			</div>
			<Button
				asChild
				size="lg"
				className="flex items-center gap-4 self-start text-xl"
			>
				<Link to="/family">
					{t("cta-start")}{" "}
					<Icon icon="arrow-circle-up-right" className="h-6 w-6 shrink-0" />
				</Link>
			</Button>
		</section>
	);
}
