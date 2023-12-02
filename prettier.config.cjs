/** @type {import("prettier").Config} */
const config = {
  // see https://github.com/withastro/prettier-plugin-astro
  plugins: [
    require.resolve('prettier-plugin-astro'),
    require.resolve('prettier-plugin-tailwindcss'),
  ],
  overrides: [
    {
      files: '*.astro',
      options: {
        parser: 'astro',
      },
    },
  ],
  // custom rules
  quoteProps: 'consistent',
  trailingComma: 'all',
  singleQuote: true,
};

module.exports = config;
