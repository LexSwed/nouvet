import { type MetaFunction } from "@remix-run/node";
import { useTranslation } from "react-i18next";
import i18n from "~/i18n/i18n.ts";
import { Link, Outlet } from "@remix-run/react";
import { Button } from "~/lib/ui/button.tsx";
import { Icon } from "~/lib/icons/icon.tsx";
import { NavCard } from "~/lib/ui/navcard.tsx";

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
		<div className="to-tertiary/5 min-h-full bg-gradient-to-br from-primary/5 pb-8 pt-4">
			<header className="container flex flex-col gap-4">
				<div className="flex flex-row items-center justify-between">
					<Link
						to="/"
						aria-label={t("link-home")}
						title={t("link-home")}
						className="-m-4 p-4"
					>
						<img src={"/icons/icon.svg"} alt="" className="h-12 w-12" />
					</Link>
					<Button asChild>
						<Link to="/family">{t("open-family-app")}</Link>
					</Button>
				</div>
				<nav>
					<ul className="spacing-bleed flex snap-x snap-mandatory flex-row gap-2 overflow-x-auto scrollbar-none">
						<li className="shrink-0">
							<Link to="/#features">
								<NavCard className="flex min-w-[8rem] flex-col place-items-start gap-2 font-medium">
									<Icon size="lg" icon="package" className="text-primary" />
									{t("features")}
								</NavCard>
							</Link>
						</li>
						<li className="shrink-0">
							<Link to="/about">
								<NavCard className="flex min-w-[8rem] flex-col place-items-start gap-2 font-medium">
									<Icon size="lg" icon="nouvet" className="text-primary" />
									{t("link-about-the-project")}
								</NavCard>
							</Link>
						</li>
						<li className="shrink-0">
							<Link to="/privacy">
								<NavCard className="flex min-w-[8rem] flex-col place-items-start gap-2 font-medium">
									<Icon size="lg" icon="scroll" className="text-primary" />
									{t("link-privacy-policy")}
								</NavCard>
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
