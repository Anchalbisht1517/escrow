import js from '@eslint/js';
import pluginN from 'eslint-plugin-n';
import prettier from 'eslint-config-prettier';
import pluginPrettier from 'eslint-plugin-prettier';

export default [
  // Base recommended rules from @eslint/js
  js.configs.recommended,

  // Node.js recommended rules
  pluginN.configs['flat/recommended'],

  // Prettier config — disables ESLint rules that conflict with Prettier
  prettier,

  {
    plugins: {
      prettier: pluginPrettier,
    },
    rules: {
      // Warn on unused vars, but ignore args and catch vars prefixed with _
      'no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_' },
      ],

      // We use console.log intentionally — don't flag it
      'no-console': 'off',

      // Run Prettier as an ESLint rule
      'prettier/prettier': 'error',

      // Node plugin: don't enforce file extensions in imports (we use them already)
      'n/no-missing-import': 'off',

      // Allow process.env access without checking
      'n/no-process-exit': 'off',

      // devDependencies (eslint, prettier, etc.) are not in 'dependencies'
      // so eslint-plugin-n falsely flags them as unpublished — disable the rule
      'n/no-unpublished-import': 'off',
    },
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
    },
  },

  {
    // Files to ignore
    ignores: ['node_modules/**', 'uploads/**', 'dist/**', 'build/**'],
  },
];
