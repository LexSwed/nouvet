import { ButtonLink, Card, Icon } from "@nou/ui";
import { Title } from "@solidjs/meta";

import { T, createTranslator } from "~/server/i18n";

import { HeroImage } from "~/lib/hero-image";

export default function WWW() {
	const t = createTranslator("www");

	return (
		<>
			<Title>{t("meta.main-title")}</Title>
			<section>
				<div class="flex flex-col items-start md:gap-12">
					<h1 class="z-10 rounded-2xl bg-background bg-main py-4 pe-4 font-bold text-6xl [background-attachment:fixed] md:h-[calc(theme(fontSize.6xl)+theme(spacing.4)*2)]">
						<T>{t("headline")}</T>
					</h1>
					<div class="flex w-full flex-row sm:gap-8">
						<ButtonLink
							href="/app"
							size="cta"
							target="_self"
							preload={false}
							variant="accent"
							class="-me-12 relative mt-16 flex shrink-0 items-center gap-4 self-start text-lg sm:me-0"
						>
							{t("cta-start")}
							<Icon use="arrow-circle-up-right" class="size-8 shrink-0" />
						</ButtonLink>
						<div class="h-full w-[85%] min-w-[320px] overflow-hidden rounded-2xl sm:top-36 sm:w-full lg:absolute lg:top-4 lg:right-4 lg:max-h-[calc(100%-theme(spacing.8))] lg:w-[65%] xl:w-[45%]">
							<HeroImage alt={t("hero-image")} />
						</div>
					</div>
				</div>
			</section>
			<section aria-labelledby="features" class="-mt-32 relative lg:mt-12">
				<h2 class="sr-only" id="features">
					{t("heading-features")}
				</h2>
				<ul class="spacing-bleed flex flex-row flex-wrap gap-4">
					<li class="max-w-64">
						<Card class="p-8">{t("feature-medical-history")}</Card>
					</li>
					<li class="max-w-64">
						<Card class="p-8">{t("feature-share-reminders")}</Card>
					</li>
					<li class="max-w-64">
						<Card class="p-8">{t("feature-connect-veterinaries")}</Card>
					</li>
				</ul>
			</section>
		</>
	);
}
