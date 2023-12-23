import { useTranslation } from "react-i18next";
import { Outlet } from "@remix-run/react";
import { Icon, type IconName } from "~/lib/icons/icon.tsx";
import { NavCard } from "~/lib/ui/card.tsx";
import { LogoLink } from "~/lib/ui/logo-link.tsx";

export let handle = { i18n: ["common", "www"] };

export default function WWWLayout() {
	const { t } = useTranslation(["www", "common"]);

	const items: Array<{ label: string; icon: IconName; href: string }> = [
		{
			href: "/#features",
			label: t("features")!,
			icon: "package",
		},
		{
			href: "/about",
			label: t("link-about-the-project")!,
			icon: "nouvet",
		},
		// {
		//   href: '/privacy',
		//   label: t('www.link-privacy-policy')!,
		//   icon: scrollIcon,
		// },
	];
	return (
		<div className="min-h-full bg-main pb-8 pt-4">
			<header className="container flex flex-col gap-4">
				<div className="flex flex-row items-center">
					<LogoLink
						label={t("app-name", { ns: "common" })}
						className="-m-4 p-4"
					/>
				</div>
				<nav>
					<ul className="-mx-4 flex snap-x snap-mandatory flex-row gap-2 overflow-x-auto p-2 scrollbar-none sm:-mx-2">
						{items.map((item) => (
							<li className="shrink-0" key={item.icon}>
								<NavCard
									to={item.href}
									className="flex min-w-[8rem] flex-col place-items-start gap-2 p-3"
								>
									<Icon size="lg" icon={item.icon} className="text-primary" />
									{item.label}
								</NavCard>
							</li>
						))}
					</ul>
				</nav>
			</header>
			<main className="container mt-8 flex flex-col gap-8">
				<Outlet />
			</main>
		</div>
	);
}
