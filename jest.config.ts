import type { Config } from 'jest';
import path from 'path';

const config: Config = {
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  transform: {
    '^.+\\.(t|j)sx?$': '@swc/jest',
  },
  extensionsToTreatAsEsm: ['.ts'],
  testEnvironment: 'node',
  setupFiles: [path.resolve(__dirname, 'jest.setup.ts')],
  clearMocks: true,
  cacheDirectory: '<rootDir>/.jest-cache',
  transformIgnorePatterns: ['node_modules/(?!(nanoid|jose|arctic|@oslojs)/)'],
};

export default config;
