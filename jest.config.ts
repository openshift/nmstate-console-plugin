import { pathsToModuleNameMapper } from 'ts-jest';
import { readConfigFile, sys } from 'typescript';

import type { Config } from '@jest/types';

const { config: tsconfig } = readConfigFile('./tsconfig.json', sys.readFile);
const { compilerOptions } = tsconfig;

const moduleNameMapper = {
  '\\.(css|less|scss|svg)$': '<rootDir>/src/__mocks__/dummy.ts',
  '@console/*': '<rootDir>/src/__mocks__/dummy.ts',
  '@openshift-console/*': '<rootDir>/src/__mocks__/dummy.ts',
  'react-i18next': '<rootDir>/src/__mocks__/react-i18next.tsx',
  ...pathsToModuleNameMapper(compilerOptions.paths, {
    prefix: '<rootDir>/',
  }),
};

const shared: Config.InitialOptions = {
  preset: 'ts-jest',
  testEnvironment: 'jest-environment-jsdom',
  modulePaths: ['<rootDir>'],
  moduleFileExtensions: ['js', 'jsx', 'ts', 'tsx'],
  transform: {
    '^.+\\.[t|j]sx?$': [
      'ts-jest',
      { tsconfig: { ...compilerOptions, module: 'commonjs', moduleResolution: 'node' } },
    ],
  },
  transformIgnorePatterns: [
    // ESM-only packages used by the integration harness must be transpiled to CJS.
    '<rootDir>/node_modules/(?!(@patternfly|@openshift-console\\S*?|@kubevirt-ui|until-async|rettime)/.*)',
  ],
};

// Sync object
const config: Config.InitialOptions = {
  projects: [
    {
      ...shared,
      displayName: 'unit',
      testMatch: [
        '<rootDir>/src/**/*.{test,spec}.{js,jsx,ts,tsx}',
        '!**/*.integration.test.{js,jsx,ts,tsx}',
      ],
      moduleNameMapper,
    },
    {
      ...shared,
      displayName: 'integration',
      // jsdom drops the Node globals MSW needs (fetch, Response, TextEncoder, MessagePort).
      testEnvironment: 'jest-fixed-jsdom',
      testMatch: ['<rootDir>/src/**/*.integration.test.{js,jsx,ts,tsx}'],
      setupFilesAfterEnv: ['<rootDir>/src/__mocks__/integration/setup.ts'],
      moduleNameMapper: {
        // Images import as URL strings (`<img src={illustration} />`), as webpack does.
        '\\.svg$': '<rootDir>/src/__mocks__/integration/svg.ts',
        // Telemetry reports "enabled" so the product does not warn about a missing console.
        '^@openshift-console/dynamic-plugin-sdk-internal$':
          '<rootDir>/src/__mocks__/integration/dynamic-plugin-sdk-internal.ts',
        // Components talk to the network through the SDK; the double issues real
        // console-proxy requests so MSW can answer them.
        '^@openshift-console/dynamic-plugin-sdk$':
          '<rootDir>/src/__mocks__/integration/dynamic-plugin-sdk.tsx',
        '^react-router$': '<rootDir>/src/__mocks__/integration/react-router.tsx',
        ...moduleNameMapper,
      },
    },
  ],
};
export default config;
