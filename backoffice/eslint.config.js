// eslint.config.js
// Flat config for ESLint 9+. No legacy .eslintrc.*
// Comment: Keep rules minimal and TS-aware.

import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";

export default [
  {
    ignores: [
      "node_modules/**",
      "dist/**",
      "build/**",
      ".vite/**"
    ],
  },
  {
    files: ["src/**/*.{ts,tsx}"],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        projectService: true, // uses TS project; works with TS 5.9 in bundler mode
        ecmaFeatures: { jsx: true }
      },
      globals: {
        ...globals.browser,
        ...globals.node
      }
    },
    plugins: {
      "@typescript-eslint": tseslint.plugin,
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh
    },
    rules: {
      // Base JS recommendations
      ...js.configs.recommended.rules,

      // TypeScript recommended
      ...tseslint.configs.recommendedTypeChecked.rules,

      // React Hooks rules
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",

      // React Fast Refresh safety
      "react-refresh/only-export-components": ["warn", { allowConstantExport: true }],

      // Project style
      "no-unused-vars": "off", // replaced by TS
      "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }]
    }
  }
];
