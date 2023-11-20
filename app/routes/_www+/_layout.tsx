import { type MetaFunction } from "@remix-run/node";
import { useTranslation } from "react-i18next";
import i18n from "~/i18n/i18n.ts";
import { Link, Outlet } from "@remix-run/react";
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

export default function WWWLayout() {
	const { t } = useTranslation("www");
	return (
		<div className="min-h-full bg-main pb-8 pt-4">
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
					<ul className="-mx-3 flex snap-x snap-mandatory scroll-p-3 flex-row gap-2 overflow-x-auto p-3 scrollbar-none">
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
							<Link to="/privacy">
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
				<Outlet />
			</main>
		</div>
	);
}
