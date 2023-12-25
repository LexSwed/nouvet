import {
	json,
	type LoaderFunctionArgs,
	type MetaFunction,
} from "@remix-run/node";
import { Trans, useTranslation } from "react-i18next";
import { ButtonLink } from "~/lib/ui/button.tsx";
import { Icon } from "~/lib/ui/icon";
import { Card } from "~/lib/ui/card.tsx";
import { HeroImage } from "~/lib/ui/hero-image.tsx";
import i18next from "~/i18n/i18next.server.ts";

export async function loader({ request }: LoaderFunctionArgs) {
	let t = await i18next.getFixedT(request, "www");
	return json({ title: t("meta.main-title") });
}

export const meta: MetaFunction<typeof loader> = ({ data }) => {
	return [{ title: data?.title }];
};

export default function IndexRoute() {
	const { t } = useTranslation("www");
	return (
		<>
			<section>
				<div className="flex flex-col items-start md:gap-12">
					<h1 className="z-10 rounded-2xl bg-background bg-main py-4 pe-4 text-6xl font-bold [background-attachment:fixed] md:h-[calc(theme(fontSize.6xl)+theme(spacing.4)*2)]">
						<Trans t={t} i18nKey={"headline"}>
							Your Pet's Well-being
							<br />
							Empowered
						</Trans>
					</h1>
					<div className="flex w-full flex-row sm:gap-8">
						<ButtonLink
							to="/app"
							size="cta"
							className="relative -me-12 mt-16 flex shrink-0 items-center gap-4 self-start text-lg sm:me-0"
						>
							{t("cta-start")}
							<Icon use="arrow-circle-up-right" className="h-8 w-8 shrink-0" />
						</ButtonLink>
						<div className="h-full w-[85%] min-w-[320px] overflow-hidden rounded-2xl sm:top-36 sm:w-full lg:absolute lg:right-4 lg:top-4 lg:max-h-[calc(100%-theme(spacing.8))] lg:w-[65%] xl:w-[45%]">
							<HeroImage alt={t("hero-image")} />
						</div>
					</div>
				</div>
			</section>
			<section aria-labelledby="features" className="relative -mt-32">
				<h2 className="sr-only" id="features">
					{t("heading-features")}
				</h2>
				<ul className="spacing-bleed -mx-4 flex snap-x snap-mandatory scroll-p-2 flex-row gap-4 overflow-x-auto px-3 scrollbar-none">
					<li className="min-w-64">
						<Card
							variant="flat"
							className="snap-start rounded-md border-2 border-primary-container/20 p-8"
						>
							{t("feature-medical-history")}
						</Card>
					</li>
					<li className="min-w-64">
						<Card
							variant="flat"
							className="snap-start rounded-md border-2 border-primary-container/20 p-8"
						>
							{t("feature-share-reminders")}
						</Card>
					</li>
					<li className="min-w-64">
						<Card
							variant="flat"
							className="snap-start rounded-md border-2 border-primary-container/20 p-8"
						>
							{t("feature-connect-veterinaries")}
						</Card>
					</li>
				</ul>
			</section>
		</>
	);
}
