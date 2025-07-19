// eslint.config.js
import pluginJs from '@eslint/js'
import prettierConfig from 'eslint-config-prettier'
import pluginPrettier from 'eslint-plugin-prettier' // <-- Adicione esta linha
import pluginReact from 'eslint-plugin-react'
import pluginReactHooks from 'eslint-plugin-react-hooks'
import globals from 'globals'
import tseslint from 'typescript-eslint'

export default [
  { files: ['**/*.{js,mjs,cjs,ts,jsx,tsx}'] },
  { languageOptions: { globals: globals.browser } },
  { languageOptions: { globals: globals.node } },
  {
    languageOptions: {
      parserOptions: { ecmaVersion: 'latest', sourceType: 'module', ecmaFeatures: { jsx: true } },
    },
  },

  // Configurações base do ESLint
  pluginJs.configs.recommended,

  // Configurações para TypeScript
  ...tseslint.configs.recommended,

  // Configurações para React
  {
    plugins: {
      react: pluginReact,
      'react-hooks': pluginReactHooks,
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
    rules: {
      ...pluginReact.configs.recommended.rules,
      ...pluginReactHooks.configs.recommended.rules,
      'react/react-in-jsx-scope': 'off',
    },
  },

  // Integração com Prettier (sempre por último para desativar regras conflitantes)
  // Certifique-se de que 'eslint-config-prettier' está na última posição para desabilitar regras conflitantes
  prettierConfig,

  // Configuração para o eslint-plugin-prettier
  {
    plugins: {
      prettier: pluginPrettier, // <-- Adicione esta linha para registrar o plugin
    },
    rules: {
      'prettier/prettier': [
        'error',
        {
          singleQuote: true,
          semi: false,
          printWidth: 100,
          trailingComma: 'es5',
        },
      ],
      // Se você usava 'plugin:prettier/recommended' antes,
      // ele também adiciona 'prettier/prettier' e 'eslint-config-prettier'
      // mas na nova configuração, você pode preferir fazer explicitamente.
      // A linha `prettierConfig` já cuida de desabilitar as regras conflitantes.
    },
  },
]
