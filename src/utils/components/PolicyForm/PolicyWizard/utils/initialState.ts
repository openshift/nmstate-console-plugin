import {
  InterfaceType,
  NodeNetworkConfigurationInterface,
  NodeNetworkConfigurationInterfaceBridgePort,
  V1NodeNetworkConfigurationPolicy,
} from '@kubevirt-ui/kubevirt-api/nmstate';
import {
  DEFAULT_OVN_BRIDGE_NAME,
  DEFAULT_OVS_BRIDGE_NAME,
} from '@utils/components/PolicyForm/PolicyWizard/utils/constants';
import { NETWORK_STATES } from '@utils/components/PolicyForm/utils/constants';
import { getRandomChars } from '@utils/helpers';
import { OVN_BRIDGE_MAPPINGS } from '@utils/resources/ovn/constants';

import NodeNetworkConfigurationPolicyModel from '../../../../../console-models/NodeNetworkConfigurationPolicyModel';

export const getInitialBridgeInterface = (ports: NodeNetworkConfigurationInterfaceBridgePort[]) =>
  ({
    name: DEFAULT_OVS_BRIDGE_NAME,
    type: InterfaceType.OVS_BRIDGE,
    state: NETWORK_STATES.Up,
    bridge: {
      'allow-extra-patch-ports': true,
      options: {
        stp: {
          enabled: false,
        },
        'mcast-snooping-enable': true,
      },
      port: ports,
    },
  } as NodeNetworkConfigurationInterface);

export const bridgeManagementInterface = {
  name: DEFAULT_OVS_BRIDGE_NAME,
  type: InterfaceType.OVS_INTERFACE,
  state: NETWORK_STATES.Up,
  ipv4: { enabled: false },
  ipv6: { enabled: false },
} as NodeNetworkConfigurationInterface;

export const getInitialLinuxBondInterface = (
  bondName: string,
  ports?: string[],
  aggregationMode?: string,
) => ({
  name: bondName,
  type: InterfaceType.BOND,
  state: NETWORK_STATES.Up,
  'link-aggregation': {
    mode: aggregationMode || '',
    port: ports || [],
  },
});

export const initialPolicy: V1NodeNetworkConfigurationPolicy = {
  apiVersion: `${NodeNetworkConfigurationPolicyModel.apiGroup}/${NodeNetworkConfigurationPolicyModel.apiVersion}`,
  kind: NodeNetworkConfigurationPolicyModel.kind,
  metadata: {
    name: `policy-${getRandomChars(8)}`,
  },
  spec: {
    desiredState: {
      ovn: {
        [OVN_BRIDGE_MAPPINGS]: [
          {
            bridge: DEFAULT_OVN_BRIDGE_NAME,
            localnet: `localnet-${getRandomChars(6)}`,
            state: 'present',
          },
        ],
      },
    },
  },
};
