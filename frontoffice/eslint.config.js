import js from '@eslint/js'
import globals from 'globals'
import tseslint from 'typescript-eslint'
import { globalIgnores } from 'eslint/config'

const reactHooksModule = await import('eslint-plugin-react-hooks').catch(async () => {
  return await import('./tools/eslint/react-hooks-fallback.js')
})

const reactHooks = reactHooksModule.default ?? reactHooksModule

const reactRefreshModule = await import('eslint-plugin-react-refresh').catch(async () => {
  return await import('./tools/eslint/react-refresh-fallback.js')
})

const reactRefresh = reactRefreshModule.default ?? reactRefreshModule

export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs['recommended-latest'],
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    rules: {
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
    },
  },
])
