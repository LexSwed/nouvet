/** @jsxImportSource solid-js */
import { type Preview } from 'storybook-solidjs';

import '@nou/config/global.css';

const preview = {
  decorators: [
    (Story) => (
      <div class="bg-background text-on-background p-8">
        <Story />
      </div>
    ),
  ],
} satisfies Preview;

export default preview;
