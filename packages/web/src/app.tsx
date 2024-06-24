import { MetaProvider } from '@solidjs/meta';
import { Router, useNavigate } from '@solidjs/router';
import { FileRoutes } from '@solidjs/start/router';
import { ErrorBoundary, Suspense } from 'solid-js';

import { env } from './server/env';

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
              if (env.DEV) {
                console.error(error);
                if (error instanceof Error) {
                  console.log(error.cause);
                  console.log(error.name);
                  console.log(error.message.includes('Hydration Mismatch'));
                }
                const navigate = useNavigate();
                navigate('/houston', { replace: false });
                return null;
              } else {
                throw error;
              }
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
