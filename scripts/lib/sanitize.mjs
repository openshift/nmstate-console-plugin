/**
 * Sanitizers shared by the cluster recorder and the offline Cypress-fixture cleanup.
 * They operate on JSON values; the caller owns reading and writing files.
 */
import prettier from 'prettier';

/**
 * The recorded payloads and fixtures are checked by `npm run lint`, so anything that writes them
 * has to print them the way Prettier does; plain `JSON.stringify` reflows arrays differently.
 */
export const formatJson = async (value, filepath) =>
  prettier.format(JSON.stringify(value, null, 2), {
    ...(await prettier.resolveConfig(filepath)),
    filepath,
  });

/**
 * Applies `replace` to every string value. Keys are left alone, so a short node name (a cluster
 * node called `sta` would otherwise rewrite the key `status`) cannot corrupt the schema.
 * `redact` keeps the same discipline for values: it matches a name only where it stands alone.
 */
const mapStringValues = (value, replace) => {
  if (typeof value === 'string') return replace(value);
  if (Array.isArray(value)) return value.map((item) => mapStringValues(item, replace));
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [key, mapStringValues(item, replace)]),
    );
  }
  return value;
};

/** Escapes a token for use inside a regular expression. */
const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * Matches a token only where it stands alone: neither neighbour may continue a *name*, so a node
 * called `net` leaves `ethernet` alone and `worker-0` leaves `worker-01` alone. Letters and
 * digits are the continuations that matter — `-` and `.` separate names in this data, as in
 * `patch-br-ex_worker-0-to-br-int` and `worker-0.pw-int-fixture`.
 */
const tokenPattern = (token, flags) =>
  new RegExp(`(?<![A-Za-z0-9])${escapeRegExp(token)}(?![A-Za-z0-9])`, flags);

const replaceToken = (input, token, replacement) =>
  input.replace(tokenPattern(token, 'g'), () => replacement);

const containsToken = (text, token) => tokenPattern(token, '').test(text);

/** Redaction shared by all resources; node names and domains are replaced whole-token. */
export const redact = (value, { domains, names }) => {
  // Longest name first, then domains: the alias numbering and the produced text do not shift.
  const replacements = [
    ...[...names].sort((a, b) => b[0].length - a[0].length),
    ...domains.map((domain) => [domain, 'example.com']),
  ];
  const withoutNames = mapStringValues(value, (input) =>
    replacements.reduce((result, [token, alias]) => replaceToken(result, token, alias), input),
  );

  let text = JSON.stringify(withoutNames, null, 2);

  const aliases = new Map();
  const aliasFor = (key, render) => {
    if (!aliases.has(key)) aliases.set(key, render(aliases.size + 1));
    return aliases.get(key);
  };

  // Address patterns are specific enough to run over keys too: a key that *is* an address is
  // private data, while the `status`-style corruption can only come from the name pass above.
  text = text.replace(/\b(?:[0-9a-f]{2}:){5}[0-9a-f]{2}\b/gi, (mac) =>
    aliasFor(`mac:${mac}`, (n) => `52:54:00:00:00:${n.toString(16).padStart(2, '0')}`),
  );
  text = text.replace(/\b(?:\d{1,3}\.){3}\d{1,3}\b/g, (ip) =>
    aliasFor(`v4:${ip}`, (n) => `192.0.2.${n}`),
  );
  text = text.replace(
    /(?<![\w:])(?:(?:[0-9a-f]{1,4}:){7}[0-9a-f]{1,4}|(?:[0-9a-f]{1,4}:){1,7}:|(?:[0-9a-f]{1,4}:){1,6}:[0-9a-f]{1,4}|(?:[0-9a-f]{1,4}:){1,5}(?::[0-9a-f]{1,4}){1,2}|(?:[0-9a-f]{1,4}:){1,4}(?::[0-9a-f]{1,4}){1,3}|(?:[0-9a-f]{1,4}:){1,3}(?::[0-9a-f]{1,4}){1,4}|(?:[0-9a-f]{1,4}:){1,2}(?::[0-9a-f]{1,4}){1,5}|[0-9a-f]{1,4}:(?::[0-9a-f]{1,4}){1,6}|:(?::[0-9a-f]{1,4}){1,7}|::)(?![\w:])/gi,
    (ip) => (ip === '::1' ? ip : aliasFor(`v6:${ip}`, (n) => `2001:db8::${n}`)),
  );

  for (const [real, alias] of names) {
    // An identity alias means the recording already carries the role-based name.
    if (real !== alias && containsToken(text, real)) {
      throw new Error(`Redaction failed: node name leaked into the recording`);
    }
  }
  for (const domain of domains) {
    if (domain !== 'example.com' && containsToken(text, domain)) {
      throw new Error(`Redaction failed: internal domain leaked into the recording`);
    }
  }
  const environmentIdentifier = text.match(/\bpsi\b|rhos-|\bqe\b/i);
  if (environmentIdentifier) {
    throw new Error(
      `Redaction failed: environment identifier "${environmentIdentifier[0]}" leaked into the recording`,
    );
  }
  if (text.includes('node.kubernetes.io/instance-type')) {
    throw new Error(`Redaction failed: environment-specific label kept in the recording`);
  }

  return JSON.parse(text);
};

// Busy clusters carry hundreds of per-operator labels per node; keep the ones that drive
// selectors, scheduling and nmstate so recordings stay reviewable.
export const KEPT_LABEL =
  /^(kubernetes\.io\/|node-role\.kubernetes\.io\/|node\.kubernetes\.io\/|node\.openshift\.io\/|topology\.kubernetes\.io\/|nmstate\.io\/)/;
// Environment-specific labels (flavor names, custom infra tags) are dropped, not published.
export const DROPPED_LABEL = /^(node\.kubernetes\.io\/instance-type|.*\.psi-|.*\.qe-)/;
export const pickLabels = (labels = {}) =>
  Object.fromEntries(
    Object.entries(labels).filter(([key]) => KEPT_LABEL.test(key) && !DROPPED_LABEL.test(key)),
  );

// LLDP identifies the neighbouring switch and port; keep the TLV shape and the protocol label,
// not the identity.
const LLDP_IDENTITY = new Set([
  'management-address',
  'port-description',
  'port-id',
  'system-description',
  'system-name',
]);

export const pruneNeighbor = (neighbor) =>
  neighbor.map((tlv) =>
    Object.fromEntries(
      Object.entries(tlv).map(([key, value]) => {
        if (LLDP_IDENTITY.has(key)) return [key, `redacted-${key}`];
        if (key === 'ieee-802-1-vlans' && Array.isArray(value)) {
          return [
            key,
            value.map((vlan) => ({
              ...vlan,
              name: `vlan-${vlan.id ?? vlan.vid ?? 'unknown'}`,
            })),
          ];
        }
        return [key, value];
      }),
    ),
  );
