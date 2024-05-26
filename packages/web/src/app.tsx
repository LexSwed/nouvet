import { MetaProvider } from '@solidjs/meta';
import { Navigate, Router } from '@solidjs/router';
import { FileRoutes } from '@solidjs/start/router';
import { ErrorBoundary, Suspense } from 'solid-js';

export default function App() {
  return (
    <ErrorBoundary
      fallback={(error) => {
        console.error(error);
        return <Navigate href="/houston" />;
      }}
    >
      <Router
        explicitLinks={true}
        preload={false}
        singleFlight={true}
        root={(props) => {
          return (
            <>
              <MetaProvider>
                <Suspense>{props.children}</Suspense>
              </MetaProvider>
            </>
          );
        }}
      >
        <FileRoutes />
      </Router>
    </ErrorBoundary>
  );
}
