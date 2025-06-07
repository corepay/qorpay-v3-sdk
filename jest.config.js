/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src', '<rootDir>/tests'],
  testMatch: [
    '**/tests/**/*.+(ts|tsx|js)',
    '**/__tests__/**/*.+(ts|tsx|js)',
    '**/?(*.)+(spec|test).+(ts|tsx|js)',
    '<rootDir>/src/**/?(*.)+(spec|test).ts?(x)',
  ],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/index.ts', // Exclude if it's just re-exporting modules
    '!src/types/**/*.ts', // Exclude type definition files from coverage
    '!src/**/types.ts', // Exclude any files named types.ts within subdirectories
    '!**/node_modules/**',
    '!**/dist/**',
    '!**/coverage/**',
    '!jest.config.js',
    '!rollup.config.mjs',
    '!typedoc.json',
  ],
  coverageReporters: ['json', 'lcov', 'text', 'clover', 'html'],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  transform: {
    '^.+\\.(ts|tsx)$': [
      'ts-jest',
      {
        tsconfig: 'tsconfig.json', // Ensure this points to your main tsconfig
        diagnostics: {
          // You can configure diagnostics reporting here if needed
          // ignoreCodes: [],
        },
      },
    ],
  },
  clearMocks: true, // Automatically clear mock calls and instances between every test
  verbose: true, // Indicates whether each individual test should be reported during the run
  // setupFilesAfterEnv: ['./jest.setup.js'], // Uncomment if you have a setup file
  moduleNameMapper: {
    // If you use path aliases in tsconfig.json, map them here
    // Example: '^@/(.*)$': '<rootDir>/src/$1'
  },
  reporters: [
    'default',
    // Add other reporters if needed, e.g., for CI environments
    // ['jest-junit', { outputDirectory: 'coverage/junit', outputName: 'junit.xml' }]
  ],
  testTimeout: 10000, // Optional: Increase timeout for tests if needed
};
