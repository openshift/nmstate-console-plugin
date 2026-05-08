# OpenShift Console Plugin for NMState

An [OpenShift web console](https://github.com/openshift/console) plugin for [kubernetes-nmstate](https://github.com/nmstate/kubernetes-nmstate). The plugin adds a web-based user interface for managing node network configuration inside the OpenShift console.

## Overview

NMState is a tool for state-driven network configuration on cluster nodes. This plugin provides four main views:

- **Policies** — create, edit, and delete `NodeNetworkConfigurationPolicy` resources
- **States** — browse `NodeNetworkState` for each node with detailed interface info
- **Physical Networks** — overview of physical network interfaces and enactment status
- **Node Network Configuration** — topology visualization of node network layouts

### Prerequisites

- [NMState Operator](https://github.com/nmstate/kubernetes-nmstate) installed on the cluster
- [OpenShift Console 4.12+](https://www.openshift.com/)

## Quick Start

```bash
git clone git@github.com:upalatucci/nmstate-console-plugin.git
cd nmstate-console-plugin
npm install
npm run start-console
```

The OpenShift console runs at http://localhost:9000 with the plugin loaded on port 9001.

Requires a running OpenShift or Kubernetes cluster (see [Development](#development) for cluster setup options).

## Development

### In-cluster development

```bash
cd nmstate-console-plugin

npm run dev -- --port 9443 \
  --server-type https \
  --server-options-key /var/serving-cert/tls.key \
  --server-options-cert /var/serving-cert/tls.crt
```

### Local development

#### Requirements

| Requirement                                         | Description                                      |
| --------------------------------------------------- | ------------------------------------------------ |
| [Node.js](https://nodejs.org/)                      | JavaScript runtime environment                   |
| [npm](https://www.npmjs.com/)                       | Package manager for Node.js (included with Node.js) |
| [Kubernetes](https://kubernetes.io/)                | An [OpenShift](https://www.openshift.com/) or Kubernetes cluster |
| [kubectl](https://kubernetes.io/docs/tasks/tools/)  | The Kubernetes command-line tool                  |

#### Setting up a local cluster

You can create a small OpenShift environment using [OpenShift Local](https://developers.redhat.com/products/openshift-local) or [KinD](https://sigs.k8s.io/kind). OpenShift Local installs all necessary services. When using KinD, you may need to set up the development environment manually.

```bash
# Deploy a minimal Kubernetes cluster with storage, registry, and admin user
bash scripts/deploy-cluster.sh

# Delete the cluster and local registry (removes all workloads and data)
bash scripts/clean-cluster.sh
```

> Running virtualized workloads (e.g. virtual machines) on this cluster requires starting the cluster as root: `sudo bash scripts/deploy-cluster.sh`

See [CLI docs](https://github.com/kubev2v/forklift-console-plugin/blob/main/docs/cli-tools.md) for more information about OpenShift Local and KinD.

#### Running with mock data

```bash
npm install
npm run start-console
```

The OpenShift console runs in a container connected to your current cluster. The plugin HTTP server runs on port 9001 with CORS enabled. The development server is available at http://localhost:9000.

`start-console` accepts these environment variables:

| Variable                             | Description                                                                |
| ------------------------------------ | -------------------------------------------------------------------------- |
| CONSOLE_IMAGE                        | Console image to run (default: `quay.io/openshift/origin-console:latest`)  |
| CONSOLE_PORT                         | Console web application port (default: `9000`)                             |
| INVENTORY_SERVER_HOST                | NMState inventory server URL (default: `http://localhost:30088`)           |
| BRIDGE_K8S_AUTH_BEARER_TOKEN         | Bearer token for user account (on OpenShift defaults to `$(oc whoami -t)`) |
| BRIDGE_K8S_MODE_OFF_CLUSTER_ENDPOINT | Kubernetes API server URL (default: guessed from kubeconfig)               |

> When running on a cluster without NMState installed, install only the missing CRDs:
>
> ```bash
> kubectl apply -f scripts/yaml/crds
> ```

#### Running with a remote NMState API server

When running [OpenShift Local](https://developers.redhat.com/products/openshift-local), install NMState and KubeVirt via OperatorHub. On [KinD](https://sigs.k8s.io/kind), use the [CI scripts](https://github.com/upalatucci/nmstate-console-plugin/tree/main/scripts).

```bash
export BRIDGE_K8S_MODE_OFF_CLUSTER_ENDPOINT=$(oc whoami --show-server)
export BRIDGE_K8S_AUTH_BEARER_TOKEN=$(oc whoami --show-token)
export INVENTORY_SERVER_HOST=https://$(oc get routes -o custom-columns=HOST:.spec.host -A | grep 'nmstate-inventory' | head -n 1)

npm run dev
```

## Deployment

### OpenShift templates

```bash
oc process -f oc-manifest.yaml \
  -p PLUGIN_NAME=nmstate-console-plugin \
  -p NAMESPACE=openshift-nmstate \
  -p IMAGE=quay.io/nmstate/nmstate-console-plugin:latest \
  | oc create -f -
```

Enable the plugin:

```bash
oc patch consoles.operator.openshift.io cluster \
  --patch '{ "spec": { "plugins": ["nmstate-console-plugin"] } }' --type=merge
```

### Helm

```bash
helm upgrade -i nmstate-console-plugin deployment/nmstate-console-plugin \
  -n openshift-nmstate --create-namespace
```

By default Helm uses `quay.io/nmstate/nmstate-console-plugin:latest`. Override with `--set image=IMAGE_NAME`.

See the chart [values](deployment/nmstate-console-plugin/values.yaml) for all parameters.

Enable the plugin (if no other console plugins are installed):

```bash
oc patch consoles.operator.openshift.io cluster \
  --patch '{ "spec": { "plugins": ["nmstate-console-plugin"] } }' --type=merge
```

If other console plugins are already installed:

```bash
oc patch consoles.operator.openshift.io cluster \
  --patch '[{ "op": "add", "path": "/spec/plugins/-", "value": "nmstate-console-plugin" }]' --type=json
```

> On OpenShift 4.10, add `--set plugin.securityContext.enabled=false` to omit Pod Security configurations.

## Testing

```bash
npm test                 # Jest unit tests
npm run test:coverage    # Jest with coverage report
npm run cypress          # Cypress e2e (headless Chrome)
npm run cypress:open     # Cypress interactive mode
```

## Contributing

Contributions are welcome. See [CONTRIBUTING.md](CONTRIBUTING.md) for coding standards and the PR process.

## Learn More

| Reference                                                                       | Description                                                 |
| ------------------------------------------------------------------------------- | ----------------------------------------------------------- |
| [NMState](https://github.com/nmstate/nmstate/)                                  | NMState project                                             |
| [OpenShift web console](https://github.com/openshift/console)                   | Web-based user interface for OpenShift                      |
| [OpenShift Dynamic Plugin SDK](https://github.com/openshift/dynamic-plugin-sdk) | Dynamic plugin SDK for OpenShift user interfaces            |
| [NMState documentation](https://nmstate.io/)                                    | Usage documentation for NMState configuration               |
| [PatternFly](https://www.patternfly.org/)                                       | Open source design system used for OpenShift UI development |

## Credit

Inspired by [forklift-console-plugin](https://github.com/kubev2v/forklift-console-plugin).
