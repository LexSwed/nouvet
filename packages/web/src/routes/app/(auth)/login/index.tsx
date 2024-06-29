import { ButtonLink, Icon } from "@nou/ui";
import { Title } from "@solidjs/meta";
import { type Component, Suspense, createSignal, lazy, onCleanup } from "solid-js";

import { createTranslator } from "~/server/i18n";

import { HeroImage } from "~/lib/hero-image";
import { LogoLink } from "~/lib/logo-link";

let DevLogin: Component = () => null;

if (__RUNNING_ON_DEV__) {
	DevLogin = lazy(() => import("~/lib/dev-login-form"));
}

function AppLoginPage() {
	const t = createTranslator("login");
	const [loading, setLoading] = createSignal(false);

	const onClick = () => {
		setLoading(true);
		const timeout = setTimeout(() => {
			setLoading(false);
		}, 1000);
		onCleanup(() => {
			clearTimeout(timeout);
		});
	};

	return (
		<>
			<Title>{t("meta.title")}</Title>
			<div class="flex min-h-full flex-col gap-12 bg-main pt-4 pb-8">
				<header class="container flex flex-row items-center justify-between">
					<LogoLink label={t("back-home")} />
					<Suspense>
						<DevLogin />
					</Suspense>
				</header>
				<section class="container flex h-full flex-[2] flex-col items-center gap-12">
					<div class="flex max-w-2xl flex-col gap-8">
						{/* TODO: Replace with carousel of app features with screenshots */}
						<HeroImage
							alt={t("hero-image")}
							class="aspect-square w-full max-w-[400px] rounded-2xl object-cover"
						/>
						<ButtonLink
							href="/api/auth/facebook"
							class="flex items-center gap-3 rounded-2xl bg-[#1877F2] intent:bg-[#1877F2] text-white outline-[#1877F2]"
							size="lg"
							link={false}
							variant="tonal"
							loading={loading()}
							onClick={onClick}
							style={{ "--btn-bg": "#1877F2" }}
						>
							<img src="/assets/facebook.svg" class="size-8" alt="" />
							{t("with-facebook")}
						</ButtonLink>
					</div>
					<ButtonLink
						href="/"
						class="mt-auto flex size-16 items-center justify-center rounded-full border-2 border-outline p-0"
						variant="ghost"
						label={t("back-home")}
					>
						<Icon use="chevron-left" size="sm" />
					</ButtonLink>
				</section>
			</div>
		</>
	);
}

export default AppLoginPage;
