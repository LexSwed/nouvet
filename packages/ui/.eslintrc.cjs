module.exports = {
  extends: ['@nou/config/eslint'],
  overrides: [
    {
      files: ['*.stories.ts', '*.stories.tsx'],
      extends: ['plugin:storybook/recommended'],
    },
  ],
};
