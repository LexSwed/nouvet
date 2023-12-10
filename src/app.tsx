// @refresh reload
import { MetaProvider } from '@solidjs/meta';
import { Router } from '@solidjs/router';
// @ts-expect-error solid issues
import { FileRoutes } from '@solidjs/start';
import { Suspense } from 'solid-js';

import './global.css';

export default function App() {
  return (
    <Router
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
      {/* <Route path="/" component={WWWLayout} load={wwwLayoutRoute.load}>
        <Route path={'/'} component={WWW} />
        <Route path={'/about'} component={About} />
        <Route path={'/privacy'} component={Privacy} />
      </Route> */}
      {/* <Route
        path="/family"
        component={FamilyLayout}
        load={familyLayoutRoute.load}
      >
        <Route path="/" component={Family} />
      </Route> */}
    </Router>
  );
}
