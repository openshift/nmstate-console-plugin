# AGENTS.md

AI-specific guidance for working with the nmstate-console-plugin codebase.

## Project Overview

This is an OpenShift console dynamic plugin for kubernetes-nmstate. It provides UI views for managing node network configuration policies, states, physical networks, and topology visualization.

**Stack:** React 18, TypeScript, PatternFly 6, OpenShift Dynamic Plugin SDK, Webpack, i18next

## Repository Structure

```text
src/
├── console-models/          # K8s resource model definitions (K8sModel objects)
├── nmstate-types/            # NMState CRD types and custom models
├── utils/
│   ├── components/           # Shared UI components (Loading, HelpTextIcon, etc.)
│   ├── hooks/                # Shared React hooks (useNMStateTranslation, etc.)
│   ├── flags/                # Feature flag detection (NMState operator presence)
│   ├── resources/            # K8s resource fetching utilities
│   └── telemetry/            # Usage tracking
├── views/
│   ├── policies/             # NodeNetworkConfigurationPolicy CRUD
│   │   ├── manifest.ts       # Plugin extension registration
│   │   ├── list/             # List page component
│   │   ├── details/          # Details page component
│   │   ├── new/              # Create/edit form
│   │   ├── actions/          # Action menu items
│   │   └── components/       # Policy-specific UI components
│   ├── states/               # NodeNetworkState list + details
│   ├── physical-networks/    # Physical network overview
│   └── nodenetworkconfiguration/  # Topology visualization (PatternFly Topology)
├── __mocks__/                # Jest mocks for SDK and i18n
└── plugin-manifest.ts        # Root plugin metadata and extension aggregation
```

## Key Patterns

### Plugin extension registration

Each view has a `manifest.ts` that exports:
- `{View}ExposedModules` — maps module names to file paths for code splitting
- `{View}Extensions` — array of `EncodedExtension` objects defining console nav items, pages, and templates

These are aggregated in the root `plugin-manifest.ts`.

### K8s resource models

Models live in `src/console-models/` as individual files exporting `K8sModel` objects. Each model defines `apiGroup`, `apiVersion`, `kind`, `plural`, and a `GroupVersionKind` constant. Import models via `@models` path alias.

### Path aliases

Defined in `tsconfig.json`:
- `@images/*` → `images/*`
- `@utils/*` → `src/utils/*`
- `@models` → `src/console-models/index.ts`

### React components

- Functional components only, typed with `FC` from React
- PatternFly 6 components for all UI elements
- Props defined as TypeScript `type` (not `interface`) in the same file or a `types.ts` file
- Default export for page-level components

### Internationalization (i18n)

- Use `useNMStateTranslation()` hook (wraps `useTranslation('plugin__nmstate-console-plugin')`)
- Translation keys use the `plugin__nmstate-console-plugin~` prefix
- In manifest files, use `%plugin__nmstate-console-plugin~Label%` syntax for nav item names

### State management

- No global state library — uses OpenShift SDK's `useK8sWatchResource` for K8s data
- Local component state via React `useState`/`useReducer`
- Custom hooks in `src/utils/hooks/` for shared logic

## Conventions

### File naming
- React components: `PascalCase.tsx`
- Utilities, hooks, constants: `camelCase.ts`
- Each view directory has a `manifest.ts`, `constants.ts`, and optionally `utils.ts`

### Imports
- Group imports: React first, then `react-router`, then internal `src/` paths, then `@kubevirt-ui`, then `@openshift-console`, then `@patternfly`
- Use path aliases (`@utils/*`, `@models`) for cross-directory imports

### Testing
- Unit tests: Jest + `ts-jest`, files named `*.test.ts` or `*.spec.ts` under `src/`
- E2E tests: Cypress, specs in `cypress/e2e/`
- Mock `@openshift-console/*` and `react-i18next` via `src/__mocks__/`

### Deployment
- Webpack builds the plugin as a dynamic console remote module
- Deployed via Helm chart (`deployment/nmstate-console-plugin/`) or OpenShift templates (`oc-manifest.yaml`)
- Container images published to `quay.io/nmstate/nmstate-console-plugin`

## Review Guidelines

When reviewing changes to this codebase:

1. **SDK compatibility** — verify that `@openshift-console/dynamic-plugin-sdk` APIs are used correctly; the SDK version is pinned to `4.22.0-prerelease.3`
2. **i18n** — all user-visible strings must use the translation hook, never hardcode English text
3. **PatternFly** — use PatternFly components instead of custom HTML; follow PatternFly 6 patterns
4. **Type safety** — `strict` is `false` in tsconfig, but new code should use explicit types
5. **Model consistency** — new K8s resources need a model in `console-models/`, a manifest entry, and registration in `plugin-manifest.ts`
6. **No direct K8s API calls** — use the OpenShift SDK hooks (`useK8sWatchResource`, `k8sCreate`, `k8sPatch`, etc.)
