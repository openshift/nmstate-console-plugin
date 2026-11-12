import { describe, expect, it } from '@jest/globals';
import type { V1NodeNetworkConfigurationPolicy } from '@kubevirt-ui-ext/kubevirt-api/nmstate';

import {
  getAggregationMode,
  getBondName,
  getBondPortNames,
  getBridgeName,
  getBridgePortNames,
  getMTU,
  getOVNBridgeName,
  getOVNLocalnet,
  getPolicyLocalnetNames,
  getUplinkConnectionOption,
} from './selectors';

const policy = (desiredState: Record<string, unknown>): V1NodeNetworkConfigurationPolicy =>
  ({ spec: { desiredState } }) as unknown as V1NodeNetworkConfigurationPolicy;

const BRIDGE_POLICY = policy({
  interfaces: [
    { bridge: { port: [{ name: 'eth0' }] }, name: 'br-ex', type: 'ovs-bridge' },
    { mtu: 1500, name: 'br-ex', type: 'ovs-interface' },
  ],
  ovn: { 'bridge-mappings': [{ bridge: 'br-ex', localnet: 'physnet-lab' }] },
});

const BOND_POLICY = policy({
  interfaces: [
    {
      'link-aggregation': { mode: 'active-backup', port: ['eth1', 'eth2'] },
      name: 'bond0',
      type: 'bond',
    },
    { name: 'br0', type: 'linux-bridge' },
  ],
  ovn: { 'bridge-mappings': [{ bridge: 'br0', localnet: 'physnet-lab' }] },
});

describe('policy selectors', () => {
  it('reads the OVN bridge mapping of a policy', () => {
    expect(getOVNLocalnet(BRIDGE_POLICY)).toBe('physnet-lab');
    expect(getOVNBridgeName(BRIDGE_POLICY)).toBe('br-ex');
    expect(getPolicyLocalnetNames(BRIDGE_POLICY)).toEqual(['physnet-lab']);
  });

  it('detects a br-ex uplink versus a bonding uplink', () => {
    expect(getUplinkConnectionOption(BRIDGE_POLICY)).toBe('brex');
    expect(getUplinkConnectionOption(BOND_POLICY)).toBe('bonding_interface');
    expect(
      getUplinkConnectionOption(
        policy({
          interfaces: [{ bridge: { port: [{ name: 'eth0' }] }, name: 'br0', type: 'ovs-bridge' }],
          ovn: { 'bridge-mappings': [{ bridge: 'br0', localnet: 'physnet-lab' }] },
        }),
      ),
    ).toBe('single_device');
    expect(getUplinkConnectionOption(policy({ interfaces: [] }))).toBe('');
  });

  it('reads bridge details', () => {
    expect(getBridgeName(BRIDGE_POLICY)).toBe('br-ex');
    expect(getBridgePortNames(BRIDGE_POLICY)).toEqual(['eth0']);
    expect(getMTU(BRIDGE_POLICY)).toBe(1500);
  });

  it('reads bond details', () => {
    expect(getBondName(BOND_POLICY)).toBe('bond0');
    expect(getBondPortNames(BOND_POLICY)).toEqual(['eth1', 'eth2']);
    expect(getAggregationMode(BOND_POLICY)).toBe('active-backup');
  });

  it('returns nothing for a policy without desired state', () => {
    const empty = {} as V1NodeNetworkConfigurationPolicy;
    expect(getOVNLocalnet(empty)).toBeUndefined();
    expect(getPolicyLocalnetNames(empty)).toEqual([]);
    expect(getBondPortNames(empty)).toBeUndefined();
  });
});
