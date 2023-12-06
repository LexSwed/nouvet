// @refresh reload
import { MetaProvider } from '@solidjs/meta';
import { Route, Router } from '@solidjs/router';
import { Suspense, lazy } from 'solid-js';

import './global.css';
import { route as wwwLayoutRoute } from './routes/(www)/(www)';
import { route as familyLayoutRoute } from './routes/family/(family)';

const WWWLayout = lazy(() => import('./routes/(www)/(www)'));
const About = lazy(() => import('./routes/(www)/about'));
const WWW = lazy(() => import('./routes/(www)/index'));
const Privacy = lazy(() => import('./routes/(www)/privacy'));

const FamilyLayout = lazy(() => import('./routes/family/(family)'));
const Family = lazy(() => import('./routes/family/index'));

export default function App() {
  return (
    <Router
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
      {/* www routes */}
      <Route path="/" component={WWWLayout} load={wwwLayoutRoute.load}>
        <Route path={'/'} component={WWW} />
        <Route path={'/about'} component={About} />
        <Route path={'/privacy'} component={Privacy} />
      </Route>
      <Route
        path="/family"
        component={FamilyLayout}
        load={familyLayoutRoute.load}
      >
        <Route path="/" component={Family} />
      </Route>
    </Router>
  );
}
