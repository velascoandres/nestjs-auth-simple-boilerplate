import type { Config } from '@jest/types';

const config: Config.InitialOptions = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  verbose: true,
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: 'src',
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  collectCoverageFrom: ['**/*.(t|j)s'],
  coverageDirectory: '../coverage',
  coveragePathIgnorePatterns: [
    'main.ts',
    '.dto.ts',
    '.module.ts',
    '.mock.ts',
    'common-imports',
    '/auth/auth-email.controller.ts',
    '/auth/auth.controller.ts',
  ],
};
export default config;
