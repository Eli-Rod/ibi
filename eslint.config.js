// eslint.config.js
// Docs (Flat config): https://eslint.org/docs/latest/use/configure/configuration-files-new
// Expo + ESLint: https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  // 1) Preset do Expo (já inclui parser, plugins, etc.)
  ...expoConfig,

  // 2) Ignora diretórios de build/artefatos
  {
    ignores: ['dist/**', 'build/**', '.expo/**'],
  },

  // 3) Suas regras/projetos (aplicadas a todos os arquivos por padrão)
  {
    rules: {
      // Proíbe importar `useTheme` do React Navigation: use o hook do seu ThemeProvider
      'no-restricted-imports': ['error', {
        paths: [{
          name: '@react-navigation/native',
          importNames: ['useTheme'],
          message:
            "Use o hook do app: import { useAppTheme as useTheme } from '../theme/ThemeProvider' (ou ajuste o caminho relativo)",
        }],
      }],
    },
  },

  // 4) (Opcional) Override específico para TS/TSX, caso queira regras extras só para TS
  // {
  //   files: ['**/*.ts', '**/*.tsx'],
  //   rules: {
  //     // suas regras extras para TS aqui
  //   },
  // },
]);