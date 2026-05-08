# Architecture

This document describes the high-level architecture of nmstate-console-plugin, an OpenShift console dynamic plugin for kubernetes-nmstate.

## System Context

```text
┌─────────────────────────────────────────────────┐
│                 OpenShift Console                │
│                                                  │
│  ┌────────────────────────────────────────────┐  │
│  │         Console Plugin Loader              │  │
│  │  (loads remote modules at runtime)         │  │
│  └──────────────┬─────────────────────────────┘  │
│                 │ loads                           │
│  ┌──────────────▼─────────────────────────────┐  │
│  │      nmstate-console-plugin                │  │
│  │  ┌──────────┐ ┌──────────┐ ┌────────────┐ │  │
│  │  │ Policies │ │  States  │ │ Phys. Net. │ │  │
│  │  └────┬─────┘ └────┬─────┘ └─────┬──────┘ │  │
│  │       │             │             │        │  │
│  │  ┌────▼─────────────▼─────────────▼──────┐ │  │
│  │  │    OpenShift Dynamic Plugin SDK       │ │  │
│  │  │  (useK8sWatchResource, k8sCreate...) │ │  │
│  │  └───────────────────┬───────────────────┘ │  │
│  └──────────────────────┼─────────────────────┘  │
│                         │                        │
└─────────────────────────┼────────────────────────┘
                          │ K8s API
              ┌───────────▼───────────┐
              │  kubernetes-nmstate   │
              │  (NMState Operator)   │
              └───────────────────────┘
```

The plugin runs as a remote webpack module loaded by the OpenShift console at runtime. It never calls the Kubernetes API directly — all cluster communication goes through the Dynamic Plugin SDK, which proxies requests through the console backend.

## Plugin Registration

The plugin registers itself with the console via `plugin-manifest.ts`, which aggregates extensions from each view's `manifest.ts`:

```text
plugin-manifest.ts
├── pluginMetadata        (name, version, exposedModules)
└── extensions[]          (nav items, pages, templates, feature flags)
    ├── PolicyExtensions         → policies/manifest.ts
    ├── StateExtensions          → states/manifest.ts
    ├── NodeNetworkConfigurationExtensions → nodenetworkconfiguration/manifest.ts
    ├── PhysicalNetworksExtensions        → physical-networks/manifest.ts
    └── console.flag             → utils/flags/ (NMSTATE_DYNAMIC)
```

Each manifest exports:
- **ExposedModules** — maps module names to file paths for webpack code splitting
- **Extensions** — typed `EncodedExtension` objects that register console navigation items, resource list/detail pages, YAML templates, and route pages

## Component Architecture

### Views

Each view is a self-contained feature directory under `src/views/`:

```text
src/views/{view}/
├── manifest.ts              # Plugin extension registration
├── constants.ts             # View-specific constants
├── utils.ts                 # View-specific utilities
├── list/                    # List page component
├── details/                 # Details page component
├── new/                     # Create/edit form (policies only)
├── actions/                 # Action menu items (policies only)
├── components/              # View-specific UI components
└── hooks/                   # View-specific React hooks
```

| View | K8s Resource | Extension Type | Perspectives |
|------|-------------|---------------|-------------|
| **policies** | `NodeNetworkConfigurationPolicy` | Resource list + details + YAML template | admin, virtualization |
| **states** | `NodeNetworkState` | Resource list | admin |
| **physical-networks** | (aggregated from enactments + states) | Href route page | admin, virtualization |
| **nodenetworkconfiguration** | (aggregated from nodes + states + enactments) | Href route page | admin, virtualization |

**Resource-based views** (policies, states) use `console.page/resource/list` and `console.page/resource/details` extensions, which automatically bind to the K8s model and provide standard console features (filtering, pagination, YAML editor).

**Route-based views** (physical-networks, nodenetworkconfiguration) use `console.page/route` and `console.navigation/href` extensions, rendering fully custom pages with their own data fetching.

### Shared Utilities

```text
src/utils/
├── components/       # Reusable UI: Loading spinner, HelpTextIcon, etc.
├── hooks/            # useNMStateTranslation, shared data hooks
├── flags/            # Feature flag: NMSTATE_DYNAMIC (set unconditionally on plugin load)
├── resources/        # K8s resource helpers organized by resource type:
│   ├── policies/     #   getters.ts, selectors.ts, utils.ts
│   ├── nns/          #   getters.tsx, utils.ts
│   ├── enactments/
│   ├── interfaces/
│   ├── neighbors/
│   └── ovn/
├── telemetry/        # Usage tracking
├── constants.ts      # Global constants
└── helpers.ts        # General utility functions (isEmpty, etc.)
```

Resource utilities follow a consistent pattern:
- **getters** — extract fields from K8s resource objects
- **selectors** — filter/sort collections of resources
- **utils** — transform or compute derived data

### K8s Models & Types

```text
src/console-models/           # K8sModel definitions (used by SDK)
├── NMStateModel.ts           #   NMState (nmstate.io/v1)
├── NodeNetworkConfigurationPolicyModel.ts
├── NodeNetworkConfigurationEnactmentModel.ts
├── NodeNetworkStateModel.ts
├── NodeModel.ts              #   Core v1 Node
├── ClusterUserDefinedNetworkModel.ts
├── modelUtils.ts             #   modelToGroupVersionKind, modelToRef helpers
└── index.ts                  #   Re-exports for @models alias

src/nmstate-types/            # NMState CRD schemas and custom types
├── crds/                     #   Raw CRD YAML files (downloaded via script)
├── custom-models/            #   Extended TypeScript type definitions
└── download-nmstate-crds.sh  #   Script to refresh CRDs from upstream
```

Models serve two purposes:
1. **SDK integration** — `K8sModel` objects tell the console how to watch, list, and navigate to resources
2. **Type safety** — NMState API types from `@kubevirt-ui/kubevirt-api/nmstate` provide TypeScript interfaces for resource objects

## Data Flow

```text
K8s API (NMState CRDs)
        │
        ▼
useK8sWatchResource(model)     ← SDK hook, real-time watch
        │
        ▼
Resource getters/selectors     ← src/utils/resources/
        │
        ▼
View component                 ← src/views/{view}/
        │
        ▼
PatternFly UI                  ← tables, forms, topology
```

1. **Watch** — view components call `useK8sWatchResource` with a `K8sModel` to establish a real-time watch on cluster resources
2. **Transform** — resource utilities (getters, selectors) extract and reshape the raw K8s objects for display
3. **Render** — PatternFly components render the data as tables, forms, detail pages, or topology graphs
4. **Mutate** — create/edit/delete operations use SDK functions (`k8sCreate`, `k8sPatch`, `k8sDelete`) which proxy through the console backend

The topology view (nodenetworkconfiguration) aggregates data from three resource types — Nodes, NodeNetworkStates, and NodeNetworkConfigurationEnactments — and renders them using PatternFly Topology.

## Feature Flags

The plugin sets a single feature flag on load:

- **`NMSTATE_DYNAMIC`** — set to `true` unconditionally via `enableNMStateDynamicFlag`. Used by physical-networks and nodenetworkconfiguration extensions to gate their nav items (these views require the plugin to be loaded).

## Build & Deployment

```text
Source (TypeScript/React)
        │
        ▼ webpack + ConsoleRemotePlugin
Remote webpack module (dist/)
        │
        ▼ Container image (Dockerfile)
quay.io/nmstate/nmstate-console-plugin
        │
        ▼ Helm chart or OC template
OpenShift Deployment + Service + ConsolePlugin CR
        │
        ▼ Console operator patches
OpenShift Console loads plugin at runtime
```

- **Webpack** builds the plugin using `ConsoleRemotePlugin` from the SDK, which generates the remote module entry points and plugin metadata
- **Deployment** creates a Kubernetes `Deployment` + `Service` serving the static assets, plus a `ConsolePlugin` custom resource that registers the plugin with the console operator
- The console operator must be patched to include `nmstate-console-plugin` in its plugin list

## Key Dependencies

| Package | Purpose |
|---------|---------|
| `@openshift-console/dynamic-plugin-sdk` | Console integration: K8s watches, navigation, pages |
| `@openshift-console/dynamic-plugin-sdk-webpack` | Webpack plugin for building console remote modules |
| `@patternfly/react-core` | UI components (tables, forms, modals, alerts) |
| `@patternfly/react-topology` | Topology graph visualization |
| `@kubevirt-ui/kubevirt-api` | TypeScript types for NMState and K8s resources |
| `react-i18next` | Internationalization framework |
