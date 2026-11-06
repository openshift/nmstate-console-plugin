# Testing

Three layers, cheapest first: unit, integration, and cluster-backed end to end. Put each
test in the lowest layer that can express the failure. Broad cluster-backed coverage of
these pages lives in the `kubevirt-ui` Playwright suite, which drives them through the real
console against a real cluster.

## Unit tests (Jest)

```bash
npm test                    # Both Jest projects: unit and integration
npm run test:coverage       # Run with coverage report
npm run test:updateSnapshot # Update snapshots
```

Unit files are `*.test.ts(x)` / `*.spec.ts(x)`; the `unit` project's `testMatch` in
`jest.config.ts` excludes `*.integration.test.*`. The SDK and i18n are mocked via
`src/__mocks__/`, so these tests need no network.

## Integration tests (Jest + React Testing Library + MSW)

The real component tree, hooks and selectors are rendered against test doubles for
`@openshift-console/dynamic-plugin-sdk`, `react-router` and `react-i18next`; MSW answers the
console-proxy requests (`/api/kubernetes/...`) that the SDK double in
`src/__mocks__/integration/dynamic-plugin-sdk.tsx` issues. The i18n double returns the key, so these
tests cover rendering, not translation resources.

Files are `*.integration.test.tsx`. `jest.config.ts` declares the second project with
`testEnvironment: 'jest-fixed-jsdom'` and
`setupFilesAfterEnv: ['<rootDir>/src/__mocks__/integration/setup.ts']`.

```bash
npx jest --selectProjects integration   # Integration project only
npx jest --selectProjects unit          # Unit project only
```

Payloads come from `src/__mocks__/integration/recordings/*.json`, recorded from a live
cluster, never hand-written. `paths.ts` holds `consoleApiPath` and the baseline empty-list
handlers for `nodes`, `nodenetworkconfigurationpolicies`,
`nodenetworkconfigurationenactments` and `nodenetworkstates`, so an ambient watch answers
empty instead of failing; `onUnhandledRequest: 'error'` keeps anything outside those four
loud.

List filters, drawers and menus are driven through the real PatternFly controls; assert
what the user sees, not component props. A healthy run prints no console output — a React,
PatternFly, MSW or YAML warning is a defect in the test or the markup, not background noise.

## Re-recording fixtures

`scripts/record-integration-fixtures.mjs` reads the current `oc` context and rewrites
`src/__mocks__/integration/recordings/{nodes,nns,nncps,nnces}.json` plus
`policy-{uplink,settings,editable}.json`. `--context <name>` pins a cluster; `--only <items>`
narrows the run and accepts `nodes,nns,nncps,nnces,shapes`.

Policy shapes come from `oc create --dry-run=server`: the API server returns the object it
would persist and nothing is created.

The recorder sanitizes as it writes — node names to `master-N`/`worker-N`, IP/MAC into
documentation ranges, internal domains to `example.com`, host identifiers (`machineID`,
`systemUUID`, `bootID`, `providerID`, `osImage`, image lists) dropped, per-operator and
environment labels trimmed — and refuses to overwrite `nncps.json`/`nnces.json` with an
empty list.

It rewrites all four list files, so capture while a fixture policy exists. Deleting an NNCP
removes its enactments but does not revert what it applied: apply a cleanup policy that sets
the interface to `state: absent` first, wait for it to converge, then delete the policies.

Re-recording on a different cluster changes node counts and enactment totals, so update the
literal expectations in the specs with the recordings.

LLDP coverage uses the checked-in `cypress/fixtures/NodeNetworkStatusWithLLDP.json`,
sanitized in place by `scripts/sanitize-cypress-fixtures.mjs`.

## Coverage

`npm run test:coverage` reports only the files the suites import. For whole-source numbers:

```bash
npx jest --coverage \
  --collectCoverageFrom='src/**/*.{ts,tsx}' \
  --collectCoverageFrom='!src/**/*.test.{ts,tsx}' \
  --collectCoverageFrom='!src/**/__mocks__/**' \
  --collectCoverageFrom='!src/**/*.d.ts'
```

## Boundary with the kubevirt-ui Playwright suite

Topology layout and zoom have no meaningful jsdom assertion, and nmstate apply and converge
semantics, RBAC and non-privileged paths, console shell navigation and plugin registration,
and LLDP discovery across multiple nodes all need a real cluster; that is where they stay.
What belongs here is "given this API payload, is this rendering correct" — it runs on every
PR without a cluster.
