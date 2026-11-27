#!/usr/bin/env node
/**
 * Offline sanitizer for the Cypress NNS fixtures that predate the recorder. The cluster
 * recorder cannot reproduce them (the test cluster has LLDP disabled and no VLAN
 * interfaces), so this applies the same name/domain/IP/MAC and neighbouring-switch
 * redaction in place, preserving the TLV shape the Cypress and Jest assertions rely on.
 *
 * Identifiers are derived from the payload itself; the script contains no cluster names.
 *
 * Usage:
 *   node scripts/sanitize-cypress-fixtures.mjs
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

import { formatJson, pruneNeighbor, redact } from './lib/sanitize.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const FIXTURES = [
  'cypress/fixtures/NodeNetworkStatusWithLLDP.json',
  'cypress/fixtures/NodeNetworkStatusWithVID.json',
];

/** Stable aliases keep already-sanitized fixtures unchanged on a second run. */
const nodeAlias = (name, index) =>
  /^(?:master|worker|node)-\d+$/.test(name) ? name : `node-${index}`;

/** Runs the neighbour TLV redaction while leaving the rest of the state shape untouched. */
const withSanitizedNeighbors = (payload) => ({
  ...payload,
  items: payload.items.map((item) => ({
    ...item,
    status: {
      ...item.status,
      currentState: {
        ...item.status?.currentState,
        interfaces: (item.status?.currentState?.interfaces ?? []).map((iface) =>
          iface.lldp?.neighbors
            ? {
                ...iface,
                lldp: {
                  ...iface.lldp,
                  neighbors: iface.lldp.neighbors.map(pruneNeighbor),
                },
              }
            : iface,
        ),
      },
    },
  })),
});

for (const file of FIXTURES) {
  const path = join(ROOT, file);
  const original = JSON.parse(readFileSync(path, 'utf8'));
  const names = new Map(
    original.items
      .map((item, index) => [item.metadata.name, nodeAlias(item.metadata.name, index)])
      .filter(([real, alias]) => real !== alias),
  );
  const domains = [
    ...new Set(
      original.items
        .map((item) => item.metadata.name.split('.').slice(1).join('.'))
        .filter((domain) => domain.length > 0),
    ),
  ];
  const sanitized = redact(withSanitizedNeighbors(original), { domains, names });
  writeFileSync(path, await formatJson(sanitized, path));
  process.stdout.write(`${file}: sanitized\n`);
}
