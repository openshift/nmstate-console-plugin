import { describe, expect, it } from '@jest/globals';
import type { V1NodeNetworkConfigurationPolicy } from '@kubevirt-ui-ext/kubevirt-api/nmstate';

import { uplinkSettingsValid } from './utils';

const policy = (interfaces: unknown[], bridge: string): V1NodeNetworkConfigurationPolicy =>
  ({
    spec: {
      desiredState: {
        interfaces,
        ovn: { 'bridge-mappings': [{ bridge, localnet: 'physnet-lab' }] },
      },
    },
  }) as V1NodeNetworkConfigurationPolicy;

describe('uplinkSettingsValid', () => {
  it('accepts the br-ex uplink without extra configuration', () => {
    expect(uplinkSettingsValid(policy([], 'br-ex'))).toBe(true);
  });

  // NUM_INTERFACES_FOR_SINGLE_INTERFACE_UPLINK is 2 in the implementation, so the
  // validation requires two bridge ports even though the option is a single device.
  it('accepts a single-device uplink with the configured number of bridge ports', () => {
    const single = policy(
      [
        {
          bridge: { port: [{ name: 'eth0' }, { name: 'eth1' }] },
          name: 'br0',
          type: 'linux-bridge',
        },
      ],
      'br0',
    );
    expect(uplinkSettingsValid(single)).toBe(true);
  });

  it('rejects a single-device uplink with fewer ports than the constant requires', () => {
    const multi = policy(
      [{ bridge: { port: [{ name: 'eth0' }] }, name: 'br0', type: 'linux-bridge' }],
      'br0',
    );
    expect(uplinkSettingsValid(multi)).toBe(false);
  });

  it('requires an aggregation mode for a bonding uplink', () => {
    const bond = (aggregation: Record<string, unknown>) =>
      policy(
        [
          { 'link-aggregation': aggregation, name: 'bond0', type: 'bond' },
          { name: 'br0', type: 'linux-bridge' },
        ],
        'br0',
      );

    expect(uplinkSettingsValid(bond({ mode: 'active-backup', port: ['eth1', 'eth2'] }))).toBe(true);
    expect(uplinkSettingsValid(bond({ port: ['eth1', 'eth2'] }))).toBe(false);
    expect(uplinkSettingsValid(bond({ mode: 'active-backup', port: ['eth1'] }))).toBe(false);
  });
});
