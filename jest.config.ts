import type { Config } from 'jest'

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  testMatch: ['**/*.test.ts', '**/*.test.tsx'],
  collectCoverageFrom: [
    // Medir apenas domain + application (use-cases, entities, value-objects, services)
    // Infrastructure (repositories, adapters) é coberta por integration tests
    'src/modules/**/domain/**/*.ts',
    'src/modules/**/application/use-cases/**/*.ts',
    'src/shared/domain/**/*.ts',
    '!**/*.d.ts',
    '!**/__tests__/**',
    '!**/index.ts',
  ],
  coverageThreshold: {
    global: {
      branches: 55,
      functions: 55,
      lines: 60,
      statements: 60,
    },
  },
}

export default config
