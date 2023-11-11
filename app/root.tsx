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
import i18n from "./i18n/i18n.server.ts";

export const links: LinksFunction = () => [
	...(cssBundleHref ? [{ rel: "stylesheet", href: cssBundleHref }] : []),
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
			<body className="text-on-background bg-background font-sans">
				<Outlet />
				<ScrollRestoration />
				<LiveReload />
				<Scripts />
			</body>
		</html>
	);
}
