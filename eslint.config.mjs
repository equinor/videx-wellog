import { defineConfig } from 'eslint/config';
import tseslint from 'typescript-eslint';
import eslint from '@eslint/js';
import importPlugin from 'eslint-plugin-import';

export default defineConfig([
  eslint.configs.recommended,
  tseslint.configs.recommended,
  importPlugin.flatConfigs.recommended,
  {
    ignores: ['dist/', 'node_modules/', 'package-lock.json'],
  },
  {
    rules: {
    "one-var": "off",
    "no-mixed-operators": "off",
    "no-restricted-properties": "off",
    "no-param-reassign": "off",
    "no-plusplus": "off",
    "no-underscore-dangle": "off",
    "no-bitwise": "off",
    "arrow-parens": "off",
    "object-curly-newline": "off",
    "prefer-destructuring": "off",
    "one-var-declaration-per-line": "off",
    "no-unused-vars": "off",
    "no-undef": "off",
    "no-dupe-class-members": "off",
    "comma-dangle": "off",
    "max-len": "off",
    "import/prefer-default-export": "off",
    "import/extensions": "off",
    "import/no-cycle": "off",
    "import/no-unresolved": "off",
    "lines-between-class-members": "off",
    // TODO: rules below had to be added due to updating eslint to v.9 they should be removed and fixed instead
    "@typescript-eslint/no-explicit-any": "off",
    "@typescript-eslint/no-unsafe-function-type": "off",
    "@typescript-eslint/no-this-alias": "off",
    "@typescript-eslint/no-empty-object-type": "off",
    "import/named": "off"
    },
  },
]);
