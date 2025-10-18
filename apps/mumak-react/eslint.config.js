import { config as viteConfig } from '@mumak/eslint-config/react-vite';

/** @type {import("eslint").Linter.Config[]} */
export default [
  ...viteConfig,
  {
    languageOptions: {
      parserOptions: {
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
];
