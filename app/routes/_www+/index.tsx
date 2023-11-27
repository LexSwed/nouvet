import { type MetaFunction } from "@remix-run/node";
import { Trans, useTranslation } from "react-i18next";
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
		<>
			<section className="@container/hero flex flex-row items-center gap-8">
				<div className="flex flex-col gap-12">
					<div className="flex flex-col gap-6">
						<h1 className="text-6xl font-bold leading-[1.1]">
							<Trans t={t} i18nKey={"headline"}>
								See yourself <br /> your pet's wellbeing
							</Trans>
						</h1>
						<h2 className="text-2xl">{t("subheadline")}</h2>
					</div>
					<Button
						asChild
						size="cta"
						className="flex items-center gap-4 self-start text-lg"
					>
						<Link to="/family">
							{t("cta-start")}{" "}
							<Icon icon="arrow-circle-up-right" className="h-6 w-6 shrink-0" />
						</Link>
					</Button>
				</div>
				<div className="w-[50%] min-w-[400px] overflow-hidden rounded-full border border-foreground object-cover p-12">
					<img
						src="https://images.unsplash.com/photo-1563460716037-460a3ad24ba9?q=80&w=2574&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
						className="aspect-[9/12] w-full rounded-full object-cover"
						alt={t("hero-image")}
					/>
				</div>
			</section>
			<h2 className="sr-only" id="features">
				{t("heading-features")}
			</h2>
		</>
	);
}
