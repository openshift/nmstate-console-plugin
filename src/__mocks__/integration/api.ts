import { http, HttpResponse } from 'msw';

import { server } from './server';

export { consoleApiPath } from './paths';

/**
 * Serves a Kubernetes list payload for a console-proxy path, the way the console
 * backend does: `{ apiVersion, kind: 'List', items }`.
 */
export const mockList = (path: string, items: unknown[]): void => {
  server.use(
    http.get(path, () =>
      HttpResponse.json({ apiVersion: 'v1', kind: 'List', metadata: {}, items }),
    ),
  );
};

/** Selects a recorded object by name, failing loudly when a re-recording drops it. */
export const findByMetadataName = <T extends { metadata: { name: string } }>(
  items: T[],
  name: string,
): T => {
  const item = items.find((candidate) => candidate.metadata.name === name);
  if (!item) {
    throw new Error(`Recording "${name}" is missing`);
  }
  return item;
};
