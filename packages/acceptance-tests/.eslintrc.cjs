module.exports = {
  extends: [require.resolve('@nou/config/eslint')],
  overrides: [
    {
      files: 'tests/**',
      extends: 'plugin:playwright/recommended',
    },
  ],
};
