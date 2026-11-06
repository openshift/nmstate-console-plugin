#!/usr/bin/env node
/**
 * Records console-proxy payloads from the current `oc` context for the Jest integration
 * tests, then sanitizes them: node names become role-based aliases, IPs and MACs move to
 * documentation ranges, internal DNS domains become example.com, and host identifiers
 * (machineID, systemUUID, bootID, providerID, image lists) are dropped.
 *
 * Usage:
 *   node scripts/record-integration-fixtures.mjs [--context <name>] [--only <items>]
 *
 * `--only` accepts `nodes,nns,nncps,nnces,shapes` or individual file stems. List payloads
 * are read with `oc get`; the `shapes` fixtures are produced by `oc create --dry-run=server`,
 * which returns the object the API server would persist without creating it. The script
 * never creates, updates or deletes cluster resources.
 */
import { execFileSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

import { formatJson, pickLabels, pruneNeighbor, redact } from './lib/sanitize.mjs';

const OUT_DIR = join(
  dirname(fileURLToPath(import.meta.url)),
  '..',
  'src',
  '__mocks__',
  'integration',
  'recordings',
);

const readFlag = (name) => {
  const index = process.argv.indexOf(name);
  if (index < 0) return undefined;
  const value = process.argv[index + 1];
  if (!value || value.startsWith('--')) {
    throw new Error(`${name} requires a value; see the usage header`);
  }
  return value;
};

const contextValue = readFlag('--context');
const context = contextValue ? ['--context', contextValue] : [];
const only = readFlag('--only')?.split(',');

const ocGet = (resource) =>
  JSON.parse(
    execFileSync('oc', ['get', resource, '-o', 'json', ...context], {
      encoding: 'utf8',
      maxBuffer: 64 * 1024 * 1024,
    }),
  );

/** Deterministic role-based aliases: masters first, then everything else, by name. */
const nodeAliases = (items) => {
  const isMaster = (node) =>
    node.metadata.labels?.['node-role.kubernetes.io/master'] !== undefined ||
    node.metadata.labels?.['node-role.kubernetes.io/control-plane'] !== undefined;
  const sorted = [...items].sort((a, b) => a.metadata.name.localeCompare(b.metadata.name));
  const counters = { master: 0, worker: 0 };
  return new Map(
    sorted.map((node) => {
      const kind = isMaster(node) ? 'master' : 'worker';
      return [node.metadata.name, `${kind}-${counters[kind]++}`];
    }),
  );
};

const pruneNode = (node) => ({
  apiVersion: node.apiVersion,
  kind: node.kind,
  metadata: {
    creationTimestamp: node.metadata.creationTimestamp,
    labels: pickLabels(node.metadata.labels),
    name: node.metadata.name,
    uid: node.metadata.uid,
  },
  status: {
    conditions: node.status?.conditions,
    nodeInfo: node.status?.nodeInfo && {
      architecture: node.status.nodeInfo.architecture,
      kubeletVersion: node.status.nodeInfo.kubeletVersion,
      operatingSystem: node.status.nodeInfo.operatingSystem,
    },
  },
});

const pruneNncp = (nncp) => ({
  apiVersion: nncp.apiVersion,
  kind: nncp.kind,
  metadata: {
    creationTimestamp: nncp.metadata.creationTimestamp,
    labels: pickLabels(nncp.metadata.labels),
    name: nncp.metadata.name,
    uid: nncp.metadata.uid,
  },
  spec: {
    ...nncp.spec,
    // Selectors can carry the same environment-specific tags as node labels.
    nodeSelector: pickLabels(nncp.spec.nodeSelector),
  },
  status: nncp.status && { conditions: nncp.status.conditions },
});

const pruneNnce = (nnce) => ({
  apiVersion: nnce.apiVersion,
  kind: nnce.kind,
  metadata: {
    creationTimestamp: nnce.metadata.creationTimestamp,
    labels: pickLabels(nnce.metadata.labels),
    name: nnce.metadata.name,
    ownerReferences: nnce.metadata.ownerReferences,
    uid: nnce.metadata.uid,
  },
  status: nnce.status && { conditions: nnce.status.conditions },
});

// Only the fields the states list, its filters and the interface drawer read.
const IFACE_KEYS = [
  'name',
  'type',
  'state',
  'mtu',
  'min-mtu',
  'max-mtu',
  'mac-address',
  'ipv4',
  'ipv6',
  'lldp',
  'bridge',
  'ovs-bridge',
  'vlan',
  'controller',
];

const pruneInterface = (iface) =>
  Object.fromEntries(
    IFACE_KEYS.filter((key) => iface[key] !== undefined).map((key) => [
      key,
      key === 'lldp' && iface.lldp?.neighbors
        ? { ...iface.lldp, neighbors: iface.lldp.neighbors.map(pruneNeighbor) }
        : iface[key],
    ]),
  );

const pruneNns = (nns) => ({
  apiVersion: nns.apiVersion,
  kind: nns.kind,
  metadata: {
    creationTimestamp: nns.metadata.creationTimestamp,
    labels: pickLabels(nns.metadata.labels),
    name: nns.metadata.name,
    uid: nns.metadata.uid,
  },
  status: {
    currentState: {
      interfaces: (nns.status?.currentState?.interfaces ?? []).map(pruneInterface),
    },
  },
});

const RESOURCES = [
  { file: 'nodes.json', prune: pruneNode, resource: 'nodes' },
  { file: 'nncps.json', prune: pruneNncp, resource: 'nodenetworkconfigurationpolicies.nmstate.io' },
  {
    file: 'nnces.json',
    prune: pruneNnce,
    resource: 'nodenetworkconfigurationenactments.nmstate.io',
  },
  { file: 'nns.json', prune: pruneNns, resource: 'nodenetworkstates.nmstate.io' },
];

// Policy shapes the form and wizard tests need. `--dry-run=server` returns the object the
// API server would persist, without creating it: these selectors match no node, so even a
// persisted copy would be inert.
const POLICY_SHAPES = [
  {
    file: 'policy-uplink.json',
    manifest: {
      apiVersion: 'nmstate.io/v1',
      kind: 'NodeNetworkConfigurationPolicy',
      metadata: { name: 'pw-int-uplink' },
      spec: {
        nodeSelector: { 'nmstate.io/int-fixture': 'absent' },
        desiredState: {
          interfaces: [],
          ovn: { 'bridge-mappings': [{ bridge: 'br-ex', localnet: '' }] },
        },
      },
    },
  },
  {
    file: 'policy-settings.json',
    manifest: {
      apiVersion: 'nmstate.io/v1',
      kind: 'NodeNetworkConfigurationPolicy',
      metadata: { name: 'pw-int-settings' },
      spec: {
        nodeSelector: { 'nmstate.io/int-fixture': 'absent' },
        desiredState: {
          interfaces: [
            { bridge: { port: [{ name: 'eth0' }] }, name: 'br0', type: 'ovs-bridge' },
            { mtu: 1500, name: 'br0', type: 'ovs-interface' },
          ],
          ovn: { 'bridge-mappings': [{ bridge: 'br0', localnet: 'physnet-lab' }] },
        },
      },
    },
  },
  {
    file: 'policy-editable.json',
    manifest: {
      apiVersion: 'nmstate.io/v1',
      kind: 'NodeNetworkConfigurationPolicy',
      metadata: { name: 'pw-int-editable' },
      spec: {
        nodeSelector: { 'nmstate.io/int-fixture': 'absent' },
        desiredState: {
          interfaces: [{ bridge: { port: [] }, name: 'br0', state: 'up', type: 'linux-bridge' }],
        },
      },
    },
  },
];

const ocDryRunCreate = (manifest) =>
  JSON.parse(
    execFileSync('oc', ['create', '--dry-run=server', '-f', '-', '-o', 'json', ...context], {
      encoding: 'utf8',
      input: JSON.stringify(manifest),
      maxBuffer: 64 * 1024 * 1024,
    }),
  );

const nodes = ocGet('nodes');
const names = nodeAliases(nodes.items);
const domains = [
  ...new Set(
    [...names.keys()]
      .map((name) => name.split('.').slice(1).join('.'))
      .filter((domain) => domain.length > 0),
  ),
];
const redaction = { domains, names };

mkdirSync(OUT_DIR, { recursive: true });
process.stdout.write(
  `context: ${execFileSync('oc', ['config', 'current-context', ...context], { encoding: 'utf8' }).trim()}\n`,
);

for (const { file, prune, resource } of RESOURCES.filter(
  ({ file }) => !only || only.includes(file.replace('.json', '')),
)) {
  const payload = ocGet(resource);
  if ((file === 'nncps.json' || file === 'nnces.json') && payload.items.length === 0) {
    throw new Error(
      `${file}: refusing to overwrite the recording with an empty list; create the ` +
        `pw-int-fixture policy (see docs/testing.md) before re-recording`,
    );
  }
  const body = redact(
    { apiVersion: payload.apiVersion, items: payload.items.map(prune), kind: 'List' },
    redaction,
  );
  writeFileSync(join(OUT_DIR, file), await formatJson(body, join(OUT_DIR, file)));
  process.stdout.write(`${file}: ${body.items.length} item(s)\n`);
}

for (const { file, manifest } of POLICY_SHAPES.filter(
  ({ file }) => !only || only.includes('shapes') || only.includes(file.replace('.json', '')),
)) {
  const body = redact(ocDryRunCreate(manifest), redaction);
  writeFileSync(join(OUT_DIR, file), await formatJson(body, join(OUT_DIR, file)));
  process.stdout.write(`${file}: dry-run ${body.metadata.name}\n`);
}
