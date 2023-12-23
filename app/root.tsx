import type { LinksFunction } from "@remix-run/node";
import {
	Links,
	LiveReload,
	Meta,
	Outlet,
	Scripts,
	ScrollRestoration,
} from "@remix-run/react";

import "./globals.css";

import { href as svgSprite } from "./lib/icons/icon.tsx";
import { useTranslation } from "react-i18next";

export const links: LinksFunction = () => [
	{ rel: "icon", href: "/icons/icon.svg", sizes: "32x32" },
	{ rel: "apple-touch-icon", href: "/icons/icon.svg" },
	{ rel: "icon", href: "/icons/icon-apple.png" },
	{ rel: "manifest", href: "/manifest.webmanifest" },
	// icons
	{ rel: "preload", href: svgSprite, as: "image" },
];

export default function App() {
	let { i18n } = useTranslation();

	return (
		<html lang={i18n.language} dir={i18n.dir(i18n.language)}>
			<head>
				<meta charSet="utf-8" />
				<meta name="viewport" content="width=device-width, initial-scale=1" />
				<Meta />
				<Links />
			</head>
			<body>
				<Outlet />
				<ScrollRestoration />
				<Scripts />
				<LiveReload />
			</body>
		</html>
	);
}
