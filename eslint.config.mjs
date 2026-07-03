// @ts-check
import eslint from '@eslint/js';
import { defineConfig } from 'eslint/config';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default defineConfig([
  {
    ignores: ['dist', 'node_modules']
  },
  {
    files: ['**/*.{js,mjs,cjs,ts}'],
    languageOptions: {
      globals: {
        ...globals.node
      }
    },
    extends: [
      eslint.configs.recommended,
      ...tseslint.configs.recommended,
      ...tseslint.configs.stylistic
    ],
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          args: 'after-used',
          varsIgnorePattern: '^_',
          ignoreRestSiblings: true
        }
      ],
      'arrow-spacing': 'error',
      eqeqeq: ['error', 'smart'],
      'no-multi-spaces': 'error',
      'no-multiple-empty-lines': 'error',
      'no-trailing-spaces': 'error',
      'no-useless-escape': 'warn',
      semi: ['error', 'always'],
      'semi-spacing': 'warn'
    }
  }
]);
