import "@nou/config/global.css";

import { MetaProvider } from "@solidjs/meta";
import { Navigate, Router } from "@solidjs/router";
import { FileRoutes } from "@solidjs/start/router";
import { ErrorBoundary, Suspense } from "solid-js";
import { isDev } from "solid-js/web";

export default function App() {
	return (
		<Router
			explicitLinks={true}
			preload={false}
			singleFlight={true}
			root={(props) => {
				return (
					<ErrorBoundary
						fallback={(error) => {
							if (isDev) {
								throw error;
							}
							return <Navigate href="/houston" />;
						}}
					>
						<MetaProvider>
							<Suspense>{props.children}</Suspense>
						</MetaProvider>
					</ErrorBoundary>
				);
			}}
		>
			<FileRoutes />
		</Router>
	);
}
