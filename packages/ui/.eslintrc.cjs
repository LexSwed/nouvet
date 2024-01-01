module.exports = {
  extends: [require.resolve('@nou/config/eslint')],
  overrides: [
    {
      files: ['*.stories.ts', '*.stories.tsx'],
      extends: ['plugin:storybook/recommended'],
    },
  ],
};
