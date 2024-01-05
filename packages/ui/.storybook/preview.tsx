/** @jsxImportSource solid-js */
import { type Preview } from 'storybook-solidjs';

import '@nou/config/global.css';
import './storybook.css';

const preview = {
  decorators: [
    (Story) => (
      <div class="bg-background text-on-background h-full w-full p-8">
        <Story />
      </div>
    ),
  ],
} satisfies Preview;

export default preview;
