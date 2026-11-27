/**
 * Console-proxy path for a cluster-scoped Kubernetes resource list. Mirrors the URL the
 * dynamic plugin SDK builds from a model's API group, version and plural; tests keep the
 * literal values so model drift shows up as a failing assertion.
 */
export const consoleApiPath = (apiGroup: string, apiVersion: string, plural: string): string =>
  `*/api/kubernetes${apiGroup ? `/apis/${apiGroup}` : '/api'}/${apiVersion}/${plural}`;

/**
 * Collections every rendered view watches. Answering them with an empty list keeps an
 * ambient watch from failing the suite, while anything outside this list stays a loud error.
 */
export const BASELINE_COLLECTIONS: readonly (readonly [string, string, string])[] = [
  ['', 'v1', 'nodes'],
  ['nmstate.io', 'v1', 'nodenetworkconfigurationpolicies'],
  ['nmstate.io', 'v1beta1', 'nodenetworkconfigurationenactments'],
  ['nmstate.io', 'v1beta1', 'nodenetworkstates'],
];
