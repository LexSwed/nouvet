import { type MetaFunction } from "@remix-run/node";
import { Trans, useTranslation } from "react-i18next";
import i18n from "~/i18n/i18n.ts";
import { Link } from "@remix-run/react";
import { Button } from "~/lib/ui/button.tsx";
import { Icon } from "~/lib/icons/icon.tsx";
import { Card, CardContent, CardHeader, CardTitle } from "~/lib/ui/card.tsx";

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
			<section className="md:flex-row flex flex-col items-center justify-between gap-12 @container/hero">
				<div className="flex flex-col gap-12">
					<div className="flex flex-col gap-6">
						<h1 className="md:text-6xl text-5xl font-bold leading-[1.1]">
							<Trans t={t} i18nKey={"headline"}>
								Your Pet's Well-being
								<br />
								Empowered
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
				<div className="md:w-[50%] md:z-auto md:min-w-[320px] -z-10 -mt-32 w-full max-w-[500px] self-end overflow-hidden rounded-full border border-foreground object-cover p-8">
					<img
						src="https://images.unsplash.com/photo-1563460716037-460a3ad24ba9?q=80&w=2574&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
						className="aspect-[9/12] w-full rounded-full bg-primary/5 object-cover"
						alt={t("hero-image")}
					/>
				</div>
			</section>
			<section aria-labelledby="features">
				<h2 className="sr-only" id="features">
					{t("heading-features")}
				</h2>
				<ul className="spacing-bleed flex snap-x snap-mandatory flex-row gap-4 overflow-x-auto pb-2">
					<li>
						<Card className="w-64 snap-start border-2 border-background bg-gradient-to-br from-primary/5 via-secondary/5 via-60% to-primary/5 shadow-sm">
							<CardHeader>
								<CardTitle>{t("feature-medical-history")}</CardTitle>
							</CardHeader>
						</Card>
					</li>
					<li>
						<Card className="w-64 snap-start border-2 border-background bg-gradient-to-br from-primary/5 via-secondary/5 via-50% to-primary/5 shadow-sm">
							<CardHeader>
								<CardTitle>{t("feature-share-reminders")}</CardTitle>
							</CardHeader>
						</Card>
					</li>
					<li>
						<Card className="w-64 snap-start border-2 border-background bg-gradient-to-br from-primary/5 via-secondary/5 via-50% to-primary/5 shadow-sm">
							<CardHeader>
								<CardTitle>{t("feature-connect-veterinaries")}</CardTitle>
							</CardHeader>
						</Card>
					</li>
				</ul>
			</section>
		</>
	);
}
