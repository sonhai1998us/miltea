import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'jest-environment-jsdom', // hoặc 'node' nếu không test UI
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', {
      tsconfig: '<rootDir>/tsconfig.jest.json',
      isolatedModules: true,
      useESM: false
    }],
  },
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  moduleNameMapper: {
    '\\.(css|scss|sass)$': 'identity-obj-proxy',
    '^@/(.*)$': '<rootDir>/src/$1', // nếu dùng alias "@"
    '^next/image$': '<rootDir>/__mocks__/nextImageMock.ts'
  },
  testPathIgnorePatterns: ['/node_modules/', '/.next/'], // nếu dùng Next.js
  testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.(tsx?)$'
};

export default config;
