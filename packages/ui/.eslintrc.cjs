module.exports = {
  extends: ['@nou/config/lint'],
  overrides: [
    {
      files: ['*.stories.ts', '*.stories.tsx'],
      extends: ['plugin:storybook/recommended'],
    },
  ],
};
