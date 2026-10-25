import { pathsToModuleNameMapper } from 'ts-jest';
import { readConfigFile, sys } from 'typescript';

import type { Config } from '@jest/types';

const { config: tsconfig } = readConfigFile('./tsconfig.json', sys.readFile);
const { compilerOptions } = tsconfig;

// Sync object
const config: Config.InitialOptions = {
  preset: 'ts-jest',
  testEnvironment: 'jest-environment-jsdom',
  testMatch: ['<rootDir>/src/**/*.{test,spec}.{js,jsx,ts,tsx}'],
  moduleNameMapper: {
    '\\.(css|less|scss|svg)$': '<rootDir>/src/__mocks__/dummy.ts',
    '@console/*': '<rootDir>/src/__mocks__/dummy.ts',
    '@openshift-console/*': '<rootDir>/src/__mocks__/dummy.ts',
    'react-i18next': '<rootDir>/src/__mocks__/react-i18next.ts',
    ...pathsToModuleNameMapper(compilerOptions.paths, {
      prefix: '<rootDir>/',
    }),
  },
  modulePaths: ['<rootDir>'],
  moduleFileExtensions: ['js', 'jsx', 'ts', 'tsx'],
  transform: {
    '^.+\\.[t|j]sx?$': [
      'ts-jest',
      { tsconfig: { ...compilerOptions, module: 'commonjs', moduleResolution: 'node' } },
    ],
  },
  transformIgnorePatterns: ['<rootDir>/node_modules/(?!(@patternfly|@openshift-console\\S*?)/.*)'],
};
export default config;
