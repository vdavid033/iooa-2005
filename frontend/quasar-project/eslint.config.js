import js from '@eslint/js'
import globals from 'globals'
import pluginVue from 'eslint-plugin-vue'
import pluginQuasar from '@quasar/app-vite/eslint'
import prettierSkipFormatting from '@vue/eslint-config-prettier/skip-formatting'

export default [
  ...pluginQuasar.configs.recommended(),
  js.configs.recommended,
  
  ...pluginVue.configs['flat/essential'],

  {
    plugins: ['prettier'],
    extends: ['plugin:prettier/recommended'], 
    rules: {
      'prettier/prettier': ['error', {
        singleQuote: true,    
        semi: false,         
      }]
    }
  },
  {
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.node,
        process: 'readonly',
        ga: 'readonly',
        cordova: 'readonly',
        Capacitor: 'readonly',
        chrome: 'readonly',
        browser: 'readonly'
      }
    },
    rules: {
      'prefer-promise-reject-errors': 'off',
      'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
      "no-magic-numbers": "off",
      "no-empty": ["error", { "allowEmptyCatch": true }],
      "padding-line-between-statements": [
        "error",
        { "blankLine": "always", "prev": "*", "next": "return" },
      ],
      "no-multiple-empty-lines": ["error", { "max": 1, "maxEOF": 0 }],
      "prettier/prettier": ["error", { "endOfLine": "auto" }]
    }
  },

  prettierSkipFormatting
]