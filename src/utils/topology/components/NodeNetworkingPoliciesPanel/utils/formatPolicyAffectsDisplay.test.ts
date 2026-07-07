import { InterfaceType, V1NodeNetworkConfigurationPolicy } from '@kubevirt-ui/kubevirt-api/nmstate';
import { LINK_AGGREGATION } from '@utils/components/PolicyForm/PolicyWizard/utils/constants';
import { NO_DATA_DASH } from '@utils/constants';

import { formatPolicyAffectsDisplay } from './formatPolicyAffectsDisplay';

const createPolicy = (
  interfaces: V1NodeNetworkConfigurationPolicy['spec']['desiredState']['interfaces'],
): V1NodeNetworkConfigurationPolicy =>
  ({
    metadata: { name: 'test-policy' },
    spec: {
      desiredState: {
        interfaces,
      },
    },
  } as V1NodeNetworkConfigurationPolicy);

describe('formatPolicyAffectsDisplay', () => {
  it('returns NO_DATA_DASH when policy has no interfaces', () => {
    expect(formatPolicyAffectsDisplay(createPolicy(undefined))).toBe(NO_DATA_DASH);
    expect(formatPolicyAffectsDisplay(createPolicy([]))).toBe(NO_DATA_DASH);
  });

  it('returns interface name for a simple ethernet interface', () => {
    const policy = createPolicy([
      {
        name: 'eth0',
        type: InterfaceType.ETHERNET,
      },
    ]);

    expect(formatPolicyAffectsDisplay(policy)).toBe('eth0');
  });

  it('returns bond name with port names for bond interfaces', () => {
    const policy = createPolicy([
      {
        name: 'bond0',
        type: InterfaceType.BOND,
        [LINK_AGGREGATION]: {
          port: ['eth0', 'eth1'],
        },
      },
    ]);

    expect(formatPolicyAffectsDisplay(policy)).toBe('bond0 (eth0, eth1)');
  });

  it('resolves bond port objects with a name property', () => {
    const policy = createPolicy([
      {
        name: 'bond0',
        type: InterfaceType.BOND,
        [LINK_AGGREGATION]: {
          port: [{ name: 'eth0' }, { name: 'eth1' }],
        },
      },
    ]);

    expect(formatPolicyAffectsDisplay(policy)).toBe('bond0 (eth0, eth1)');
  });

  it('returns bridge name with port names for linux bridge interfaces', () => {
    const policy = createPolicy([
      {
        name: 'br0',
        type: InterfaceType.LINUX_BRIDGE,
        bridge: {
          port: [{ name: 'eth0' }, { name: 'eth1' }],
        },
      },
    ]);

    expect(formatPolicyAffectsDisplay(policy)).toBe('br0 (eth0, eth1)');
  });

  it('returns bridge name with port names for ovs bridge interfaces', () => {
    const policy = createPolicy([
      {
        name: 'ovs-br0',
        type: InterfaceType.OVS_BRIDGE,
        bridge: {
          port: [{ name: 'eth0' }],
        },
      },
    ]);

    expect(formatPolicyAffectsDisplay(policy)).toBe('ovs-br0 (eth0)');
  });

  it('returns bridge name with nested bond port names when bridge contains a bond port', () => {
    const policy = createPolicy([
      {
        name: 'br0',
        type: InterfaceType.LINUX_BRIDGE,
        bridge: {
          port: [
            { name: 'eth0' },
            {
              name: 'bond0',
              [LINK_AGGREGATION]: {
                port: ['eth1', 'eth2'],
              },
            },
          ],
        },
      },
    ]);

    expect(formatPolicyAffectsDisplay(policy)).toBe('br0 (eth0, eth1, eth2)');
  });

  it('joins multiple interface affects with commas', () => {
    const policy = createPolicy([
      {
        name: 'eth0',
        type: InterfaceType.ETHERNET,
      },
      {
        name: 'bond0',
        type: InterfaceType.BOND,
        [LINK_AGGREGATION]: {
          port: ['eth1', 'eth2'],
        },
      },
    ]);

    expect(formatPolicyAffectsDisplay(policy)).toBe('eth0, bond0 (eth1, eth2)');
  });
});
