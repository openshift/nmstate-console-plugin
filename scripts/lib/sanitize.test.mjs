import assert from 'node:assert/strict';
import test from 'node:test';

import { redact } from './sanitize.mjs';

const noDomains = { domains: [], names: new Map() };

test('a short node name leaves a longer word alone', () => {
  // `net` is a plausible node name and a substring of `ethernet`; only the standalone word moves.
  assert.deepEqual(
    redact(
      { spec: { note: 'net is up', type: 'ethernet' } },
      {
        domains: [],
        names: new Map([['net', 'worker-0']]),
      },
    ),
    { spec: { note: 'worker-0 is up', type: 'ethernet' } },
  );
});

test('a name inside a compound value is replaced', () => {
  assert.deepEqual(
    redact(
      { metadata: { name: 'sta.pw-int-fixture' } },
      {
        domains: [],
        names: new Map([['sta', 'node-0']]),
      },
    ),
    { metadata: { name: 'node-0.pw-int-fixture' } },
  );
});

test('a name inside a hyphen-delimited value is replaced, a longer name is not', () => {
  const names = new Map([
    ['worker-0', 'node-0'],
    ['sta.pw-int-fixture', 'node-1'],
  ]);
  // nmstate names bridge patches as `<policy>_<node>-to-<bridge>`: the hyphen ends the name, and
  // the full node name wins over the short one when both are known.
  assert.deepEqual(
    redact(
      {
        a: 'patch-br-ex_worker-0-to-br-int',
        b: 'patch-br-ex_worker-01-to-br-int',
        c: 'patch-br-ex_sta.pw-int-fixture-to-br-int',
      },
      { domains: [], names },
    ),
    {
      a: 'patch-br-ex_node-0-to-br-int',
      b: 'patch-br-ex_worker-01-to-br-int',
      c: 'patch-br-ex_node-1-to-br-int',
    },
  );
  // In a key the name survives the value pass, so the guard has to see through the hyphen too.
  assert.throws(
    () =>
      redact(
        {
          'patch-br-int-to-br-ex_worker-0': 'up',
          'patch-br-int-to-br-ex_sta.pw-int-fixture': 'up',
        },
        { domains: [], names },
      ),
    /Redaction failed: node name/,
  );
});

test('a short name used as a key aborts the recording', () => {
  assert.throws(
    () => redact({ net: 'ready' }, { domains: [], names: new Map([['net', 'worker-0']]) }),
    /Redaction failed: node name/,
  );
});

test('an identity alias is accepted', () => {
  const value = { metadata: { name: 'worker-0' } };
  assert.deepEqual(
    redact(value, { domains: [], names: new Map([['worker-0', 'worker-0']]) }),
    value,
  );
});

test('one address gets one alias everywhere', () => {
  assert.deepEqual(
    redact({ a: { mac: '00:11:22:33:44:55' }, b: ['00:11:22:33:44:55'] }, noDomains),
    { a: { mac: '52:54:00:00:00:01' }, b: ['52:54:00:00:00:01'] },
  );
});

test('a short domain stays token-bounded', () => {
  assert.deepEqual(
    redact({ a: 'label in lab', b: 'switch.lab' }, { domains: ['lab'], names: new Map() }),
    { a: 'label in example.com', b: 'switch.example.com' },
  );
});
