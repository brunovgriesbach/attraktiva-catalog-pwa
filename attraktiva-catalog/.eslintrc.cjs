module.exports = {
  root: true,
  ignorePatterns: ['dist'],
  env: {
    browser: true,
    es2020: true,
  },
  extends: ['eslint:recommended', 'plugin:react-hooks/recommended'],
  plugins: ['react-refresh', '@typescript-eslint'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    ecmaFeatures: { jsx: true },
  },
  rules: {
    '@typescript-eslint/no-unused-vars': [
      'error',
      { varsIgnorePattern: '^[A-Z_]' },
    ],
    'react-refresh/only-export-components': 'error',
  },
}
