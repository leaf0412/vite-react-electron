module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react-hooks/recommended',
  ],
  ignorePatterns: ['dist', '.eslintrc.cjs'],
  parser: '@typescript-eslint/parser',
  plugins: ['react-refresh'],
  rules: {
    'react-refresh/only-export-components': [
      'warn',
      { allowConstantExport: true }
    ],
    'react-hooks/exhaustive-deps': 'warn',
  },
  overrides: [
    {
      files: ['src/main/**/*.{ts,js}'],
      env: {
        node: true,
        browser: false,
      },
      extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended'],
      rules: {
        'no-console': 'off',
      },
    },
  ],
};
