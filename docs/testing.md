# Testing

Three layers, cheapest first: unit, integration, and cluster-backed end to end. Put each
test in the lowest layer that can express the failure. Broad cluster-backed coverage of
these pages lives in the `kubevirt-ui` Playwright suite, which drives them through the real
console against a real cluster.

## Unit tests (Jest)

```bash
npm test                    # Both Jest projects plus the sanitizer tests
npm run test:coverage       # Run with coverage report
npm run test:updateSnapshot # Update snapshots
```

Unit files are `*.test.ts(x)` / `*.spec.ts(x)`; the `unit` project's `testMatch` in
`jest.config.ts` excludes `*.integration.test.*`. The SDK is mocked via `src/__mocks__/`, so
these tests need no network.

## Integration tests (Jest + React Testing Library + MSW)

The real component tree, hooks and selectors are rendered against test doubles for
`@openshift-console/dynamic-plugin-sdk` and `react-router`; MSW answers the
console-proxy requests (`/api/kubernetes/...`) that the SDK double in
`src/__mocks__/integration/dynamic-plugin-sdk.tsx` issues. `src/__mocks__/i18n.ts` (unit) and
`src/__mocks__/integration/i18n.ts` (integration) initialize i18next from
`locales/en/plugin__nmstate-console-plugin.json`, so `t` and `Trans` interpolate and
pluralize against the real English catalog.

Files are `*.integration.test.tsx`. `jest.config.ts` declares the second project with
`testEnvironment: 'jest-fixed-jsdom'` and
`setupFilesAfterEnv: ['<rootDir>/src/__mocks__/integration/setup.ts']`.

The integration project runs as ESM: Jest starts with `--experimental-vm-modules` (see
`npm run test:integration`), `jest.config.ts` treats `.ts`/`.tsx` as ESM for that project, and
ts-jest emits ESM. msw 3 is ESM-only and needs Node 22.12 or newer, so the runtime is required
rather than optional; the unit project keeps the CommonJS transform.

Two consequences of that runtime:

- jsdom leaves out Node's `setImmediate`, and msw's interceptor schedules request handling with
  it, so `src/__mocks__/integration/nodeGlobals.ts` supplies it through `setupFiles`.
- `@patternfly` packages are CommonJS-typed but ship ESM sources, and the CommonJS build of
  `@patternfly/react-data-view` requires `react-tokens/dist/esm/*`; that scope is transformed
  instead of loaded as-is, and ts-jest emits each file in the format Jest loads it in. Fixtures
  and other JSON import with `with { type: 'json' }`, since Jest treats a bare JSON import as
  deprecated under ESM.

```bash
npm run test:integration   # Integration project only
npm run test:unit          # Unit project only
```

Payloads come from `src/__mocks__/integration/recordings/*.json`, recorded from a live
cluster, never hand-written. `paths.ts` holds `consoleApiPath` and the baseline empty-list
handlers for `nodes`, `nodenetworkconfigurationpolicies`,
`nodenetworkconfigurationenactments` and `nodenetworkstates`, so an ambient watch answers
empty instead of failing; `onUnhandledFrame: 'error'` keeps anything outside those four
loud.

Menus, drawers and the state-list filters are driven through the real PatternFly controls;
assert what the user sees, not component props. The policy-list filter is the exception: the
SDK double renders `ListPageFilter` as plain checkboxes. A healthy run prints no console
output — a React, PatternFly, MSW or YAML warning is a defect in the test or the markup, not
background noise.

## Re-recording fixtures

`scripts/record-integration-fixtures.mjs` reads the current `oc` context and rewrites
`src/__mocks__/integration/recordings/{nodes,nns,nncps,nnces}.json` plus
`policy-{uplink,settings,editable}.json`. `--context <name>` pins a cluster; `--only <items>`
narrows the run and accepts `nodes,nns,nncps,nnces,shapes`.

Set the cluster once, as `CTX` below, and pass it to the fixture policy, the recording and
the cleanup, so those steps can never touch different clusters.

Policy shapes come from `oc create --dry-run=server`: the API server returns the object it
would persist and nothing is created.

The recorder sanitizes as it writes — node names to `master-N`/`worker-N`, IP/MAC into
documentation ranges, domains derived from node names to `example.com`, host identifiers
(`machineID`, `systemUUID`, `bootID`, `providerID`, `osImage`, image lists) dropped,
per-operator and environment labels trimmed — and refuses to overwrite `nncps.json`/`nnces.json`
with an empty list. Only node-name domains are rewritten, so review a fresh recording for
internal domains and other identifying data before committing it.

It rewrites all four list files, so capture while the fixture policy the suites assert on is
applied: a `pw-int-fixture` policy that brings `dummy0` up and reports three available
enactments. Use a disposable cluster and confirm the names are unused first: the policy
changes node network state, and the cleanup removes `dummy0` from every selected worker.

```bash
CTX=<cluster-name>
oc --context "$CTX" get nncp pw-int-fixture               # expect: Error from server (NotFound)
oc --context "$CTX" get nns -o json | grep -c '"dummy0"'  # expect: 0
oc --context "$CTX" apply -f - <<'EOF'
apiVersion: nmstate.io/v1
kind: NodeNetworkConfigurationPolicy
metadata:
  name: pw-int-fixture
spec:
  nodeSelector:
    node-role.kubernetes.io/worker: ""
  desiredState:
    interfaces:
      - name: dummy0
        state: up
        type: dummy
EOF
oc --context "$CTX" wait --for=condition=Available nodenetworkconfigurationpolicies.nmstate.io/pw-int-fixture --timeout=5m
node scripts/record-integration-fixtures.mjs --context "$CTX"
```

Deleting an NNCP removes its enactments but does not revert what it applied: apply a
cleanup policy that sets the interface to `state: absent` first, wait for it to converge,
then delete the policies, all with `--context "$CTX"`.

Re-recording on a different cluster changes node counts and enactment totals, so update the
literal expectations in the specs with the recordings.

LLDP coverage uses the checked-in `cypress/fixtures/NodeNetworkStatusWithLLDP.json`,
sanitized in place by `scripts/sanitize-cypress-fixtures.mjs`.

## Coverage

`npm run test:coverage` reports only the files the suites import. For whole-source numbers:

```bash
NODE_OPTIONS=--experimental-vm-modules npx jest --coverage \
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
