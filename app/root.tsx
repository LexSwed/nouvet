import { cssBundleHref } from "@remix-run/css-bundle";
import type { LinksFunction, LoaderFunctionArgs } from "@remix-run/node";
import {
	Links,
	LiveReload,
	Meta,
	Outlet,
	Scripts,
	ScrollRestoration,
	json,
	useLoaderData,
} from "@remix-run/react";

import "./globals.css";

import { href as svgSprite } from "./lib/icons/icon.tsx";
import i18next from "./i18n/i18next.server.ts";
import { useTranslation } from "react-i18next";

export async function loader({ request }: LoaderFunctionArgs) {
	let locale = await i18next.getLocale(request);
	return json({ locale });
}
export const links: LinksFunction = () => [
	...(cssBundleHref ? [{ rel: "stylesheet", href: cssBundleHref }] : []),
	{ rel: "icon", href: "/icons/icon.svg", sizes: "32x32" },
	{ rel: "apple-touch-icon", href: "/icons/icon.svg" },
	{ rel: "icon", href: "/icons/icon-apple.png" },
	{ rel: "manifest", href: "/manifest.webmanifest" },
	// icons
	{ rel: "preload", href: svgSprite, as: "image" },
];

export default function App() {
	// Get the locale from the loader
	let { locale } = useLoaderData<typeof loader>();

	let { i18n } = useTranslation();

	return (
		<html lang={i18n.language} dir={i18n.dir(i18n.language)}>
			<head>
				<meta charSet="utf-8" />
				<meta name="viewport" content="width=device-width, initial-scale=1" />
				<Meta />
				<Links />
			</head>
			<body className="text-on-background h-full bg-background font-sans">
				<div id="app">
					<Outlet />
				</div>
				<ScrollRestoration />
				<LiveReload />
				<Scripts />
			</body>
		</html>
	);
}
