/** @type {import("prettier").Config} */
const config = {
  // see https://github.com/withastro/prettier-plugin-astro
  plugins: [
    require.resolve('prettier-plugin-tailwindcss'),
    require.resolve('@ianvs/prettier-plugin-sort-imports'),
  ],
  // custom rules
  quoteProps: 'consistent',
  trailingComma: 'all',
  singleQuote: true,
  importOrder: [
    '^@?solid(.*)$',
    '^@nou/(.*)$',
    '<THIRD_PARTY_MODULES>',
    '',
    '^~(/.*)$',
    '^(../.*)',
    '',
    '^(?!.*[.]css$)[./].*$',
    '',
    '.css$',
  ],
  overrides: [
    {
      files: ['*.json', '.*rc'],
      options: {
        trailingComma: 'none',
      },
    },
  ],
};

module.exports = config;
