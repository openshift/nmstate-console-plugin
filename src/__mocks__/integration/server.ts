import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

import { BASELINE_COLLECTIONS, consoleApiPath } from './paths';

const emptyList = { apiVersion: 'v1', kind: 'List', metadata: {}, items: [] };

/**
 * MSW server shared by every integration test. Handlers registered through `mockList`
 * (see `./api.ts`) are layered on top per test. The initial handlers survive
 * `server.resetHandlers()`, so every test starts from an empty cluster instead of an
 * unhandled-request error.
 */
export const server = setupServer(
  ...BASELINE_COLLECTIONS.map(([apiGroup, apiVersion, plural]) =>
    http.get(consoleApiPath(apiGroup, apiVersion, plural), () => HttpResponse.json(emptyList)),
  ),
);
