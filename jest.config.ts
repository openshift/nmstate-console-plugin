import { pathsToModuleNameMapper } from 'ts-jest';
import { readConfigFile, sys } from 'typescript';

import type { Config } from '@jest/types';

const { config: tsconfig } = readConfigFile('./tsconfig.json', sys.readFile);
const { compilerOptions } = tsconfig;

const moduleNameMapper = {
  '\\.(css|less|scss|svg)$': '<rootDir>/src/__mocks__/dummy.ts',
  '@console/*': '<rootDir>/src/__mocks__/dummy.ts',
  '@openshift-console/*': '<rootDir>/src/__mocks__/dummy.ts',
  ...pathsToModuleNameMapper(compilerOptions.paths, {
    prefix: '<rootDir>/',
  }),
};

const cjsTransform: Config.InitialOptions['transform'] = {
  '^.+\\.[t|j]sx?$': [
    'ts-jest',
    { tsconfig: { ...compilerOptions, module: 'commonjs', moduleResolution: 'node' } },
  ],
};

const shared: Config.InitialOptions = {
  testEnvironment: 'jest-environment-jsdom',
  modulePaths: ['<rootDir>'],
  moduleFileExtensions: ['js', 'jsx', 'ts', 'tsx', 'mjs', 'cjs'],
};

// Sync object
const config: Config.InitialOptions = {
  projects: [
    {
      ...shared,
      displayName: 'unit',
      preset: 'ts-jest',
      testMatch: [
        '<rootDir>/src/**/*.{test,spec}.{js,jsx,ts,tsx}',
        '!**/*.integration.test.{js,jsx,ts,tsx}',
      ],
      moduleNameMapper,
      // Real translations: `t` interpolates and pluralizes like the console does.
      setupFiles: ['<rootDir>/src/__mocks__/i18n.ts'],
      transform: cjsTransform,
      transformIgnorePatterns: [
        // Packages that ship untranspiled sources must be transpiled to CJS for this project.
        '<rootDir>/node_modules/(?!(@patternfly|@openshift-console\\S*?|@kubevirt-ui)/.*)',
      ],
    },
    {
      ...shared,
      displayName: 'integration',
      // jsdom drops the Node globals MSW needs (fetch, Response, TextEncoder, MessagePort).
      testEnvironment: 'jest-fixed-jsdom',
      testMatch: ['<rootDir>/src/**/*.integration.test.{js,jsx,ts,tsx}'],
      setupFilesAfterEnv: ['<rootDir>/src/__mocks__/integration/setup.ts'],
      // msw 3 and its dependencies are ESM-only; the project runs under Jest's ESM runtime.
      extensionsToTreatAsEsm: ['.ts', '.tsx'],
      transform: {
        '^.+\\.[t|j]sx?$': [
          'ts-jest',
          { useESM: true, tsconfig: { ...compilerOptions, module: 'esnext' } },
        ],
      },
      transformIgnorePatterns: [
        // `@patternfly` packages are CommonJS-typed yet ship ESM sources (`react-data-view`'s
        // CommonJS build requires `react-tokens/dist/esm/*`), so they must be transformed
        // rather than loaded as-is; ts-jest emits each file in the format Jest loads it in.
        '<rootDir>/node_modules/(?!(@patternfly|@openshift-console\\S*?|@kubevirt-ui)/.*)',
      ],
      // jsdom supplies neither `setImmediate` nor a JSON import attribute on its own.
      setupFiles: [
        '<rootDir>/src/__mocks__/integration/nodeGlobals.ts',
        '<rootDir>/src/__mocks__/integration/i18n.ts',
      ],
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
