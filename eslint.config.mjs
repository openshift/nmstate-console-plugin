import prettierConfig from 'eslint-config-prettier';
import cypressPlugin from 'eslint-plugin-cypress';
import importPlugin from 'eslint-plugin-import';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import globals from 'globals';
import tseslint from 'typescript-eslint';

import js from '@eslint/js';

export default tseslint.config(
  {
    ignores: [
      // .gitignore:
      '**/node_modules/',
      '**/dist/',
      'cypress/videos',
      'cypress/screenshots',
      '**/.DS_Store',
      '.env',
      // legacy
      'i18n-scripts/',
      // generated
      'package-lock.json',
      'locales/',
      'src/nmstate-types/',
    ],
  },

  js.configs.recommended,
  ...tseslint.configs.recommended,
  reactPlugin.configs.flat.recommended,

  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.es2021,
      },
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
    },
    plugins: {
      import: importPlugin,
      'react-hooks': reactHooksPlugin,
      'simple-import-sort': simpleImportSort,
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-shadow': 'off',
      '@typescript-eslint/no-unused-expressions': 'off',
      '@typescript-eslint/no-unused-vars': ['error', { varsIgnorePattern: '^_' }],

      'import/no-cycle': 'off',
      'import/no-duplicates': 'error',

      'no-console': 'error',
      'no-nested-ternary': 'error',

      'react-hooks/exhaustive-deps': 'warn',
      'react-hooks/rules-of-hooks': 'error',
      'react/display-name': 'off',
      'react/prop-types': 'off',

      'simple-import-sort/exports': 'error',
      'simple-import-sort/imports': [
        'warn',
        {
          groups: [
            [
              '^(assert|buffer|child_process|cluster|console|constants|crypto|dgram|dns|domain|events|fs|http|https|module|net|os|path|punycode|querystring|readline|repl|stream|string_decoder|sys|timers|tls|tty|url|util|vm|zlib|freelist|v8|process|async_hooks|http2|perf_hooks)(/.*|$)',
            ],
            ['^react', '^\\w'],
            ['^(@|config/)(/*|$)'],
            ['^\\u0000'],
            ['^\\.\\.(?!/?$)', '^\\.\\./?$'],
            ['^\\./(?=.*/)(?!/?$)', '^\\.(?!/?$)', '^\\./?$'],
            ['^.+\\.s?css$'],
          ],
        },
      ],
    },
    settings: {
      react: { version: 'detect' },
    },
  },

  {
    files: ['**/*.{js,cjs}', 'webpack.config.ts', 'jest.config.ts', 'cypress.config.ts'],
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
    rules: {
      '@typescript-eslint/no-require-imports': 'off',
    },
  },

  {
    files: ['cypress/**/*.{js,ts,jsx,tsx}'],
    ...cypressPlugin.configs.recommended,
    languageOptions: {
      globals: {
        ...globals.node,
        ...cypressPlugin.configs.globals.languageOptions.globals,
      },
    },
    rules: {
      ...cypressPlugin.configs.recommended.rules,
      '@typescript-eslint/no-namespace': 'off',
      '@typescript-eslint/no-require-imports': 'off',
      'no-console': 'off',
      'no-redeclare': 'off',
    },
  },

  // last to disable conflicting rules
  prettierConfig,
);
