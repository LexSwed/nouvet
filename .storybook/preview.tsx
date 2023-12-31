/** @jsxImportSource solid-js */
import { type Preview } from 'storybook-solidjs';

import '../src/global.css';

const preview = {
  decorators: [
    (Story) => (
      <div class="bg-background p-8 text-on-background">
        <Story />
      </div>
    ),
  ],
} satisfies Preview;

export default preview;
