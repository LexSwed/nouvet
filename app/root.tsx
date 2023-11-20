import { cssBundleHref } from "@remix-run/css-bundle";
import type { LinksFunction } from "@remix-run/node";
import {
	Links,
	LiveReload,
	Meta,
	Outlet,
	Scripts,
	ScrollRestoration,
} from "@remix-run/react";
import "@fontsource-variable/inter";

import "./globals.css";

import i18n from "./i18n/i18n.ts";
import { href as svgSprite } from "./lib/icons/icon.tsx";

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
	return (
		<html lang={i18n.language} dir={i18n.dir(i18n.language)}>
			<head>
				<meta charSet="utf-8" />
				<meta name="viewport" content="width=device-width, initial-scale=1" />
				<Meta />
				<Links />
			</head>
			<body className="text-on-background h-full bg-background font-sans">
				<Outlet />
				<ScrollRestoration />
				<LiveReload />
				<Scripts />
			</body>
		</html>
	);
}
