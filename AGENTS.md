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

### React components & i18n

For coding standards (component rules, PatternFly usage, i18n, linting), see [CONTRIBUTING.md](CONTRIBUTING.md#coding-standards).

Key details for code generation:
- Translation keys use the `plugin__nmstate-console-plugin~` prefix
- In manifest files, use `%plugin__nmstate-console-plugin~Label%` syntax for nav item names
- Shared hooks (used in multiple locations) live in `src/utils/hooks/`; single-use hooks are co-located with the component that uses them

### State management

- No global state library — uses OpenShift SDK's `useK8sWatchResource` for K8s data
- Local component state via React `useState`/`useReducer`

## Conventions

For full coding standards, linting rules, testing, and PR process, see [CONTRIBUTING.md](CONTRIBUTING.md).

### File & directory naming
- React components: `PascalCase.tsx`
- Utilities, hooks, constants: `camelCase.ts`
- Directories for components use PascalCase, directories for hooks use camelCase, all other directories use kebab-case
- Each view directory has a `manifest.ts`, `constants.ts`, and optionally `utils.ts`

### Deployment
- Webpack builds the plugin as a dynamic console remote module
- Deployed via Helm chart (`deployment/nmstate-console-plugin/`) or OpenShift templates (`oc-manifest.yaml`)
- Container images published to `quay.io/nmstate/nmstate-console-plugin`

## Review Guidelines

When reviewing changes to this codebase:

1. **SDK compatibility** — verify that `@openshift-console/dynamic-plugin-sdk` APIs are used correctly; the SDK version should correspond to the nmstate branch
2. **i18n** — all user-visible strings must use the `useNMStateTranslation` hook or the `Trans` component; never hardcode English text
3. **PatternFly** — use PatternFly components and PF utility classes instead of custom HTML/CSS; follow PatternFly 6 patterns
4. **Type safety** — `strict` is `false` in tsconfig, but new code should use explicit types
5. **Model consistency** — new K8s resources need a model in `console-models/`, a manifest entry, and registration in `plugin-manifest.ts`
6. **No direct K8s API calls** — use the OpenShift SDK hooks (`useK8sWatchResource`, `k8sCreate`, `k8sPatch`, etc.)
