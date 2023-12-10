// @refresh reload
import { MetaProvider } from '@solidjs/meta';
import { Route, Router } from '@solidjs/router';
// @ts-expect-error solid issues
import { FileRoutes } from '@solidjs/start';
import { Suspense, lazy } from 'solid-js';

import './global.css';
import { route as wwwLayoutRoute } from './pages/(www)/(www)';

// I want routes grouping. See https://github.com/unjs/nitro/issues/1205
const WWWLayout = lazy(() => import('./pages/(www)/(www)'));
const About = lazy(() => import('./pages/(www)/about'));
const WWW = lazy(() => import('./pages/(www)/index'));
const Privacy = lazy(() => import('./pages/(www)/privacy'));

export default function App() {
  return (
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
      {/* www routes */}
      <Route path="/" component={WWWLayout} load={wwwLayoutRoute.load}>
        <Route path={'/'} component={WWW} />
        <Route path={'/about'} component={About} />
        <Route path={'/privacy'} component={Privacy} />
      </Route>
    </Router>
  );
}
