import { MetaProvider } from '@solidjs/meta';
import { Router } from '@solidjs/router';
import { FileRoutes } from '@solidjs/start';
import { Suspense } from 'solid-js';

import '@nou/config/global.css';

export default function App() {
  return (
    <>
      <Router
        explicitLinks={true}
        preload={false}
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
    </>
  );
}
