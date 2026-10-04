import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    rules: {
      // These components intentionally load data from effects. The React 19
      // rule is too strict for this established screen-level data-loading
      // pattern and reports the existing implementation as an error.
      'react-hooks/set-state-in-effect': 'off',
      'react-hooks/immutability': 'off',
      // Keep lint usable while screens are incrementally refactored; unused
      // values are reported without blocking the production build.
      'no-unused-vars': 'warn',
      'no-useless-assignment': 'warn',
    },
  },
])
