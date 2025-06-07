module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2021,
    sourceType: 'module',
    project: ['./tsconfig.json'], // Path to your tsconfig.json
    // project: ['./tsconfig.json', './tests/tsconfig.json'], // If you have a separate tsconfig for tests
    tsconfigRootDir: __dirname,
  },
  env: {
    browser: true,
    node: true,
    es2021: true,
    jest: true, // For Jest global variables in test files
  },
  plugins: [
    '@typescript-eslint',
    'jest', // For Jest-specific linting rules
    'prettier', // Integrates Prettier with ESLint
  ],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended', // Base TypeScript rules
    'plugin:@typescript-eslint/recommended-requiring-type-checking', // Rules requiring type information
    'plugin:jest/recommended', // Recommended Jest rules
    'prettier', // Turns off ESLint rules that conflict with Prettier
  ],
  rules: {
    'prettier/prettier': ['warn', {}, { usePrettierrc: true }], // Report Prettier issues as ESLint warnings

    // General ESLint rules
    'no-console': ['warn', { allow: ['warn', 'error'] }], // Allow console.warn and console.error
    'no-debugger': 'error',
    eqeqeq: ['error', 'always'],
    curly: ['warn', 'all'],
    'no-unused-vars': 'off', // Disable base rule, use TypeScript version
    'no-shadow': 'off', // Disable base rule, use TypeScript version

    // TypeScript specific rules
    '@typescript-eslint/no-unused-vars': [
      'warn',
      {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        caughtErrorsIgnorePattern: '^_',
      },
    ],
    '@typescript-eslint/no-explicit-any': 'warn', // Warn instead of error for 'any'
    '@typescript-eslint/explicit-module-boundary-types': 'warn', // Warn for missing explicit return types
    '@typescript-eslint/no-inferrable-types': 'warn', // Warns on explicit type declarations that can be inferred
    '@typescript-eslint/no-shadow': ['error'],
    '@typescript-eslint/no-floating-promises': ['error', { ignoreVoid: true }], // Handles unhandled promises
    '@typescript-eslint/consistent-type-imports': 'warn', // Enforce 'import type'
    '@typescript-eslint/no-misused-promises': [
      'error',
      {
        checksVoidReturn: false, // Allow void-returning functions in promise contexts (e.g. event handlers)
      },
    ],
    '@typescript-eslint/no-unnecessary-type-assertion': 'warn',
    '@typescript-eslint/restrict-template-expressions': [
      'warn',
      {
        allowNumber: true,
        allowBoolean: true,
        allowAny: false, // Be stricter with 'any' in template expressions
        allowNullish: true,
      },
    ],
    // SDK specific considerations:
    // It's often good to be explicit in SDKs
    '@typescript-eslint/explicit-function-return-type': [
      'warn',
      {
        allowExpressions: true,
        allowTypedFunctionExpressions: true,
        allowHigherOrderFunctions: true,
      },
    ],
    // Consider enabling if you want to enforce stricter object shapes
    // '@typescript-eslint/no-unsafe-assignment': 'warn',
    // '@typescript-eslint/no-unsafe-call': 'warn',
    // '@typescript-eslint/no-unsafe-member-access': 'warn',
    // '@typescript-eslint/no-unsafe-return': 'warn',

    // Jest specific rules (can be fine-tuned)
    'jest/no-disabled-tests': 'warn',
    'jest/no-focused-tests': 'error',
    'jest/no-identical-title': 'error',
    'jest/prefer-to-have-length': 'warn',
    'jest/valid-expect': 'error',
  },
  overrides: [
    {
      files: ['*.js', '*.mjs', '*.cjs'], // For JS config files
      rules: {
        '@typescript-eslint/no-var-requires': 'off',
        '@typescript-eslint/explicit-module-boundary-types': 'off',
        '@typescript-eslint/no-unsafe-assignment': 'off',
        '@typescript-eslint/no-unsafe-call': 'off',
        '@typescript-eslint/no-unsafe-member-access': 'off',
      },
    },
    {
      files: ['tests/**/*.ts', '**/*.test.ts', '**/*.spec.ts'],
      env: {
        jest: true,
      },
      rules: {
        '@typescript-eslint/no-explicit-any': 'off', // Often 'any' is used in test mocks
        '@typescript-eslint/no-unsafe-assignment': 'off',
        '@typescript-eslint/no-unsafe-call': 'off',
        '@typescript-eslint/no-unsafe-member-access': 'off',
        '@typescript-eslint/no-unsafe-return': 'off',
        '@typescript-eslint/no-floating-promises': 'off', // Sometimes promises are intentionally not awaited in tests
        '@typescript-eslint/unbound-method': 'off', // Common with Jest's expect(...).toBeCalledWith(...)
        'jest/expect-expect': [ // Enforce assertions in tests
          'warn',
          {
            assertFunctionNames: ['expect', 'request.**.expect'], // Add other assertion functions if used
          },
        ],
      },
    },
  ],
  ignorePatterns: [
    'node_modules/',
    'dist/',
    'coverage/',
    'docs/',
    'rollup.config.mjs',
    'jest.config.js',
    'typedoc.json',
    '.prettierrc.js', // if you have it as .js
  ],
};
