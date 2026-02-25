// @ts-check
import eslint from '@eslint/js';
import prettierPlugin from 'eslint-plugin-prettier/recommended';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  // ----------------------------------------
  // Ignored files
  // ----------------------------------------
  {
    ignores: ['eslint.config.mjs', 'dist/', 'node_modules/'],
  },

  // ----------------------------------------
  // Base JS recommended
  // ----------------------------------------
  eslint.configs.recommended,

  // ----------------------------------------
  // TypeScript strict configs (type-aware)
  // ----------------------------------------
  ...tseslint.configs.recommendedTypeChecked,

  // ----------------------------------------
  // Prettier integration (no conflicting formatting rules)
  // ----------------------------------------
  prettierPlugin,

  // ----------------------------------------
  // Global language settings
  // ----------------------------------------
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
      globals: {
        ...globals.node,
        ...globals.jest,
      },
      sourceType: 'module',
    },
  },

  // ----------------------------------------
  // Global rules (safe but strict)
  // ----------------------------------------
  {
    rules: {
      // TS rules
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/no-misused-promises': 'error',

      // Allow unsafe arguments (Prisma often triggers this falsely)
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',

      // Formatting
      'prettier/prettier': ['error', { endOfLine: 'auto' }],
    },
  },

  // ======================================================================
  // SPECIAL PRISMA OVERRIDES (to silence false positives in complex generics)
  // ======================================================================
  {
    files: [
      'src/types/entities/**/*.ts',
      'src/helpers/mappers/**/*.ts',
      'src/modules/**/repositories/*.ts',
      'src/prisma/**/*.ts',
    ],
    rules: {
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
    },
  },

  // ======================================================================
  // NestJS Decorators Override (Avoids "unused vars" false positives)
  // ======================================================================
  {
    files: ['src/**/*.ts'],
    rules: {
      // don't warn when variables start with `_` → common in NestJS decorators
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_' },
      ],
    },
  },

  // ======================================================================
  // Jest overrides if needed
  // ======================================================================
  {
    files: ['**/*.spec.ts', '**/*.test.ts'],
    languageOptions: {
      globals: globals.jest,
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
    },
  },
);
