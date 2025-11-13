// eslint.config.js
import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import { globalIgnores } from 'eslint/config';

// Dynamic imports with fallbacks kept
const reactHooksModule = await import('eslint-plugin-react-hooks').catch(async () => {
  return await import('./tools/eslint/react-hooks-fallback.js');
});
const reactHooks = reactHooksModule.default ?? reactHooksModule;

const reactRefreshModule = await import('eslint-plugin-react-refresh').catch(async () => {
  return await import('./tools/eslint/react-refresh-fallback.js');
});
const reactRefresh = reactRefreshModule.default ?? reactRefreshModule;

export default tseslint.config([
  // Ignore build output
  globalIgnores(['dist']),

  // JS/TS + React ruleset in flat config
  {
    files: ['**/*.{ts,tsx}'],
    // Do NOT spread react-hooks or react-refresh preset configs to avoid legacy "plugins: []"
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended, // Flat-compatible
    ],
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: 'module',
      globals: {
        ...globals.browser,
        // Add Node globals if needed by tooling files:
        // ...globals.node,
      },
    },
    // Register plugins as an OBJECT, not an array
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      // TypeScript hygiene
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
          ignoreRestSiblings: true,
          varsIgnorePattern: '^_',
        },
      ],

      // React Hooks recommended baseline
      // (explicit to avoid pulling legacy presets)
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',

      // React Refresh rule used by Vite React plugin
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
    },
  },
]);
