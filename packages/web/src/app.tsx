import "@nou/config/global.css";
import { Toaster } from "@nou/ui";

import { MetaProvider } from "@solidjs/meta";
import { Navigate, Router } from "@solidjs/router";
import { FileRoutes } from "@solidjs/start/router";
import { ErrorBoundary, Suspense } from "solid-js";
import { createTranslator } from "./server/i18n";

export default function App() {
	const t = createTranslator("app");
	return (
		<Router
			explicitLinks={true}
			preload={false}
			singleFlight={true}
			root={(props) => {
				return (
					<ErrorBoundary
						fallback={(error) => {
							console.error(error);
							if (import.meta.env.DEV) {
								throw error;
							}
							return <Navigate href="/houston" />;
						}}
					>
						<MetaProvider>
							<Suspense>{props.children}</Suspense>
						</MetaProvider>
						<Toaster label={t("notifications-region")!} />
					</ErrorBoundary>
				);
			}}
		>
			<FileRoutes />
		</Router>
	);
}
