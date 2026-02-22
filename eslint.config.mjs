import tseslint from 'typescript-eslint';
import htmlPlugin from '@html-eslint/eslint-plugin';
import htmlParser from '@html-eslint/parser';

const tsFiles = ['src/**/*.ts', '__tests__/**/*.ts'];

export default tseslint.config(
  {
    ignores: ['dist/**'],
  },

  // TypeScript files
  ...tseslint.configs.recommended.map((config) => ({
    ...config,
    files: tsFiles,
  })),
  {
    files: tsFiles,
    rules: {
      semi: ['error', 'always'],
      'comma-dangle': ['error', 'always-multiline'],
      '@typescript-eslint/consistent-type-definitions': ['error', 'type'],
      '@typescript-eslint/consistent-type-assertions': ['error', { assertionStyle: 'angle-bracket' }],
      '@typescript-eslint/no-non-null-assertion': 'error',
      'no-restricted-syntax': ['error', {
        selector: 'ChainExpression',
        message: 'Optional chaining (?.) is not allowed. Use explicit if or type cast instead.',
      }],
    },
  },

  // HTML files
  {
    files: ['src/**/*.html'],
    plugins: {
      '@html-eslint': htmlPlugin,
    },
    languageOptions: {
      parser: htmlParser,
    },
    rules: {
      '@html-eslint/require-doctype': 'error',
      '@html-eslint/no-duplicate-id': 'error',
      '@html-eslint/require-closing-tags': ['error', { selfClosing: 'always' }],
      '@html-eslint/no-extra-spacing-attrs': ['error', { enforceBeforeSelfClose: true }],
      '@html-eslint/require-lang': 'error',
      '@html-eslint/require-title': 'error',
      '@html-eslint/no-multiple-h1': 'warn',
      '@html-eslint/require-meta-charset': 'error',
      '@html-eslint/no-target-blank': 'error',
      '@html-eslint/attrs-newline': 'off',
      '@html-eslint/indent': 'off',
    },
  },

  // JS config files (vite.config.js etc.) — disable type-checked rules
  {
    files: ['*.js'],
    ...tseslint.configs.disableTypeChecked,
  },
);
