import {
  InterfaceType,
  NodeNetworkConfigurationInterface,
  NodeNetworkConfigurationInterfaceBridgePort,
  V1NodeNetworkConfigurationPolicy,
} from '@kubevirt-ui/kubevirt-api/nmstate';
import {
  DEFAULT_OVN_BRIDGE_NAME,
  DEFAULT_OVS_BRIDGE_NAME,
  LINK_AGGREGATION,
  WORKER_NODE_LABEL,
} from '@utils/components/PolicyForm/PolicyWizard/utils/constants';
import { NETWORK_STATES } from '@utils/components/PolicyForm/utils/constants';
import { OVN_BRIDGE_MAPPINGS } from '@utils/resources/ovn/constants';

import NodeNetworkConfigurationPolicyModel from '../../../../../console-models/NodeNetworkConfigurationPolicyModel';
import { NodeNetworkConfigurationInterfaceBondMode as AggregationMode } from '../../../../../nmstate-types/custom-models/NodeNetworkConfigurationInterfaceBondMode';

export const getInitialOVSBridgeInterface = (
  ports: NodeNetworkConfigurationInterfaceBridgePort[],
) =>
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

export const getInitialOVSBridgeWithBond = (
  bondName: string,
  bridgePorts: NodeNetworkConfigurationInterfaceBridgePort[],
) => {
  const ports = [
    ...bridgePorts,
    {
      name: bondName,
      [LINK_AGGREGATION]: {
        mode: AggregationMode.BALANCE_SLB,
        port: [],
      },
    },
  ];
  return getInitialOVSBridgeInterface(ports);
};

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
  [LINK_AGGREGATION]: {
    mode: aggregationMode || '',
    port: ports || [],
  },
});

export const getInitialPolicy = (
  policyName: string,
  physicalNetworkName?: string,
): V1NodeNetworkConfigurationPolicy => {
  return {
    apiVersion: `${NodeNetworkConfigurationPolicyModel.apiGroup}/${NodeNetworkConfigurationPolicyModel.apiVersion}`,
    kind: NodeNetworkConfigurationPolicyModel.kind,
    metadata: {
      name: policyName,
    },
    spec: {
      nodeSelector: {},
      desiredState: {
        ovn: {
          [OVN_BRIDGE_MAPPINGS]: [
            {
              bridge: DEFAULT_OVN_BRIDGE_NAME,
              localnet: physicalNetworkName,
              state: 'present',
            },
          ],
        },
      },
    },
  };
};
