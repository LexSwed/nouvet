/** @jsxImportSource solid-js */
import { MemoryRouter, Route } from '@solidjs/router';
import { type Preview } from 'storybook-solidjs';

import '@nou/config/global.css';
import './storybook.css';

import { Suspense } from 'solid-js';

const preview = {
  decorators: [
    (Story) => {
      const component = () => (
        <div class="bg-background text-on-background h-full w-full p-8">
          <Story />
        </div>
      );
      return (
        <MemoryRouter
          root={(props) => {
            return <Suspense>{props.children}</Suspense>;
          }}
        >
          <Route path="/" component={component}></Route>
        </MemoryRouter>
      );
    },
  ],
} satisfies Preview;

export default preview;
