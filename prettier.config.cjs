/** @type {import("prettier").Config} */
const config = {
  // see https://github.com/withastro/prettier-plugin-astro
  plugins: [require.resolve('prettier-plugin-tailwindcss')],
  // custom rules
  quoteProps: 'consistent',
  trailingComma: 'all',
  singleQuote: true,
};

module.exports = config;
