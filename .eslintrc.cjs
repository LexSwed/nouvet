module.exports = {
  root: true,
  plugins: ['tailwindcss', '@typescript-eslint', 'solid'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:tailwindcss/recommended',
    'plugin:solid/typescript',
  ],
  rules: {
    // good to know this can be enforced
    'tailwindcss/no-custom-classname': 'off',
    // conflicts with prettier
    'tailwindcss/classnames-order': 'off',
  },
  overrides: [
    {
      env: {
        node: true,
      },
      files: ['.eslintrc.cjs', 'prettier.config.cjs', 'tailwind.config.ts'],
      parserOptions: {
        sourceType: 'script',
      },
    },
    {
      files: ['*.ts', '*.tsx'],
      parser: '@typescript-eslint/parser',
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
      plugins: ['@typescript-eslint'],
      extends: ['plugin:solid/typescript'],
    },
  ],
};
