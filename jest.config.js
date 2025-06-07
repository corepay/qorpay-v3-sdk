/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src', '<rootDir>/tests'],
  testMatch: [
    '**/tests/**/*.test.+(ts|tsx|js)',
    '**/__tests__/**/*.+(ts|tsx|js)',
    '**/?(*.)+(spec|test).+(ts|tsx|js)',
  ],
  testPathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/dist/',
  ],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/index.ts',
    '!src/types/**/*.ts',
    '!**/node_modules/**',
    '!**/dist/**',
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
    '^.+\\.(ts|tsx)$': ['ts-jest', {
      tsconfig: 'tsconfig.json',
      isolatedModules: true,
      diagnostics: {
        ignoreCodes: [2571, 6031, 18003, 2339]
      }
    }]
  },
  transformIgnorePatterns: [
    '/node_modules/(?!msw).+\\.js$'
  ],
  clearMocks: true,
  verbose: true,
  setupFiles: ['<rootDir>/tests/setup/axiosMock.ts'],
  reporters: [
    'default',
  ],
  testTimeout: 30000,
  globals: {
    'ts-jest': {
      isolatedModules: true
    }
  }
};
