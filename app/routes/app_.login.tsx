import type { LoaderFunctionArgs } from "@remix-run/node";
import {
	json,
	useNavigation,
	type MetaFunction,
	redirect,
} from "@remix-run/react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import i18next from "~/i18n/i18next.server.ts";
import { Icon } from "~/lib/ui/icon";
import { ButtonLink } from "~/lib/ui/button.tsx";
import { HeroImage } from "~/lib/ui/hero-image.tsx";
import { LogoLink } from "~/lib/ui/logo-link.tsx";
import { getSafeRequestUser } from "~/auth/cookie.server";

export async function loader({ request }: LoaderFunctionArgs) {
	const user = await getSafeRequestUser(request);
	if (user.success) {
		throw redirect("/app");
	}
	let t = await i18next.getFixedT(request, "login");
	return json({ title: t("meta.title") });
}

export const meta: MetaFunction<typeof loader> = ({ data }) => {
	return [{ title: data?.title }];
};

export let handle = { i18n: ["common", "login"] };

export default function AppLoginPage() {
	const { t } = useTranslation(["login", "common"]);
	const navigation = useNavigation();

	const isLoading = "/api/auth/facebook" === navigation.location?.pathname;

	return (
		<div className="flex min-h-full flex-col gap-12 bg-main pb-8 pt-4">
			<header className="container">
				<LogoLink label={t("link-home", { ns: "common" })} />
			</header>
			<section className="container flex h-full flex-[2] flex-col items-center gap-12">
				<div className="flex max-w-2xl flex-col gap-8">
					{/* TODO: Replace with carousel of app features with screenshots */}
					<HeroImage
						alt={t("hero-image")}
						className="aspect-square w-full rounded-2xl"
					/>
					<ButtonLink
						to="/api/auth/facebook"
						className="flex items-center gap-3 !bg-[#1877F2]"
						size="lg"
						loading={isLoading}
					>
						<img src="/assets/facebook.svg" className="h-8 w-8" alt="" />
						{t("with-facebook")}
					</ButtonLink>
				</div>
				<ButtonLink
					to="/"
					className="mt-auto h-16 w-16 rounded-full border-2 border-outline p-0"
					variant="ghost"
					title={t("back-home")}
				>
					<Icon use="chevron-left" size="xl" />
				</ButtonLink>
			</section>
		</div>
	);
}
