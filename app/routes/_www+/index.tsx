import { type MetaFunction } from "@remix-run/node";
import { useTranslation } from "react-i18next";
import i18n from "~/i18n/i18n.server.ts";
import { Link } from "@remix-run/react";
import { Button } from "~/lib/ui/button.tsx";
import { Icon } from "~/lib/icons/icon.tsx";
import { Card } from "~/lib/ui/card.tsx";

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
			<header className="container flex flex-col gap-4">
				<div className="flex flex-row items-center justify-between">
					<a href="/" title={t("link-home")} className="-m-4 p-4">
						<img src={"/icons/icon.svg"} className="h-12 w-12" />
					</a>
					<Button asChild>
						<Link to="/family">{t("open-family-app")}</Link>
					</Button>
				</div>
				<nav>
					<ul className="scrollbar-none -mx-3 flex snap-x snap-mandatory scroll-p-3 flex-row gap-2 overflow-x-auto p-3">
						<li className="shrink-0">
							<Link to="#features">
								<Card className="flex min-w-[8rem] flex-col place-items-start gap-2">
									<Icon size="lg" icon="package" className="text-primary/60" />
									{t("features")}
								</Card>
							</Link>
						</li>
						<li className="shrink-0">
							<Link to="/about">
								<Card className="flex min-w-[8rem] flex-col place-items-start gap-2">
									<Icon size="lg" icon="nouvet" className="text-primary/60" />
									{t("link-about-the-project")}
								</Card>
							</Link>
						</li>
						<li className="shrink-0">
							<Link to="/privacy-policy">
								<Card className="flex min-w-[8rem] flex-col place-items-start gap-2">
									<Icon size="lg" icon="scroll" className="text-primary/60" />
									{t("link-privacy-policy")}
								</Card>
							</Link>
						</li>
					</ul>
				</nav>
			</header>
			<main className="container mt-8 flex flex-col gap-8">
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
			</main>
		</div>
	);
}
