import { extendTailwindMerge, type ClassNameValue } from 'tailwind-merge';

const customTwMerge = extendTailwindMerge({
  extend: {
    theme: {
      spacing: ['font'],
    },
  },
});

export function tw(...classNames: ClassNameValue[]) {
  return customTwMerge(...classNames);
}
