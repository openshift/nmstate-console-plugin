export const adminOnlyDescribe = Cypress.env('NON_PRIV') ? xdescribe : describe;
export const adminOnlyIT = Cypress.env('NON_PRIV') ? xit : it;

export const TEST_NS = Cypress.env('TEST_NS') || 'cy-test-ns';

export const SECOND = 1000;
export const MINUTE = 60000;

export enum K8S_KIND {
  NNCP = 'nncp',
  NNS = 'nns',
  NNCE = 'nnce',
  NAD = 'net-attach-def',
  Project = 'project',
}
