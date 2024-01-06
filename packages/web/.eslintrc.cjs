module.exports = {
  plugins: ['drizzle'],
  extends: [
    require.resolve('@nou/config/eslint'),
    'plugin:drizzle/recommended',
  ],
};
