import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'
import tseslint from 'typescript-eslint';
import node from 'eslint-plugin-node';

export default defineConfig([
 // Ignore the dist directory for both configurations
  globalIgnores(['dist']),
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs['recommended-latest'],
      reactRefresh.configs.vite,
    ],
    languageOptions: {
 env: { browser: true, es2022: true }, // Set environment for browser and ES2022
      ecmaVersion: 2022, // Or your preferred ES version for frontend
      globals: { ...globals.browser, ...globals.builtin }, // Include browser and built-in globals
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    rules: {
      'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]' }],
    },
  },
  {
    files: ['functions/src/**/*.ts'],
    parser: '@typescript-eslint/parser',
    extends: [
      js.configs.recommended,
      ...tseslint.configs.recommended,
      node.configs.recommended,
    ],
    languageOptions: {
 env: { node: true, es2022: true }, // Set environment for Node.js and ES2022
      globals: { ...globals.node, ...globals.builtin }, // Include Node.js and built-in globals
      parserOptions: { // Add parserOptions for TypeScript config
        project: ['functions/tsconfig.json'], // Point to your functions tsconfig
      }
    },
  },
])
