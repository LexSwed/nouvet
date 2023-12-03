// @refresh reload
import { MetaProvider } from '@solidjs/meta';
import { Route, Router } from '@solidjs/router';
import { Suspense } from 'solid-js';

import './global.css';

import WWWLayout from './routes/www/_layout';
import About from './routes/www/about';
import WWW from './routes/www/index';
import Privacy from './routes/www/privacy';

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
      <Route path="/" component={WWWLayout}>
        <Route path={'/'} component={WWW} />
        <Route path={'/about'} component={About} />
        <Route path={'/privacy'} component={Privacy} />
      </Route>
    </Router>
  );
}
