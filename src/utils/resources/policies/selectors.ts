import {
  InterfaceType,
  NodeNetworkConfigurationInterfaceBridgePort,
  V1NodeNetworkConfigurationPolicy,
} from '@kubevirt-ui/kubevirt-api/nmstate';
import { LINK_AGGREGATION } from '@utils/components/PolicyForm/PolicyWizard/utils/constants';
import { OVN_BRIDGE_MAPPINGS } from '@utils/resources/ovn/constants';
import {
  getPolicyBondingInterfaces,
  getPolicyBridgingInterfaces,
} from '@utils/resources/policies/utils';

export const getPolicyInterfaces = (policy: V1NodeNetworkConfigurationPolicy) =>
  policy?.spec?.desiredState?.interfaces;

export const getOVN = (policy: V1NodeNetworkConfigurationPolicy) => policy?.spec?.desiredState?.ovn;

export const getBridgeInterface = (policy: V1NodeNetworkConfigurationPolicy) =>
  getPolicyBridgingInterfaces(policy)?.[0];

export const getBridgeManagementInterface = (policy: V1NodeNetworkConfigurationPolicy) =>
  getPolicyInterfaces(policy)?.filter((iface) => iface?.type === InterfaceType.OVS_INTERFACE)?.[0];

export const getBridgePorts = (policy: V1NodeNetworkConfigurationPolicy) =>
  getBridgeInterface(policy)?.bridge?.port || [];

export const getBondInterface = (policy: V1NodeNetworkConfigurationPolicy) =>
  getPolicyBondingInterfaces(policy)?.[0];

export const getPolicyInterface = (policy: V1NodeNetworkConfigurationPolicy) =>
  getPolicyInterfaces(policy)?.[0];

export const getMTU = (policy: V1NodeNetworkConfigurationPolicy) =>
  getBridgeManagementInterface(policy)?.mtu;

export const getInterfaceName = (policy: V1NodeNetworkConfigurationPolicy) =>
  getPolicyInterface(policy)?.name;

export const getBond = (policy: V1NodeNetworkConfigurationPolicy) =>
  getBondInterface(policy) || getOVSBridgeBondPort(policy);

export const getLinkAggregationSettings = (policy: V1NodeNetworkConfigurationPolicy) =>
  getBond(policy)?.[LINK_AGGREGATION];

export const getAggregationMode = (policy: V1NodeNetworkConfigurationPolicy) =>
  getLinkAggregationSettings(policy)?.mode;

export const getBondInterfacePorts = (policy: V1NodeNetworkConfigurationPolicy): string[] =>
  getBondInterface(policy)?.[LINK_AGGREGATION]?.port;

export const getOVSBridgeBondPort = (policy: V1NodeNetworkConfigurationPolicy) =>
  getBridgePorts(policy)?.find((port) => port?.[LINK_AGGREGATION]);

export const getBridgeBondPorts = (
  policy: V1NodeNetworkConfigurationPolicy,
): NodeNetworkConfigurationInterfaceBridgePort[] =>
  getOVSBridgeBondPort(policy)?.[LINK_AGGREGATION].port;

export const getBondPorts = (policy: V1NodeNetworkConfigurationPolicy) =>
  getBondInterfacePorts(policy) || getBridgeBondPorts(policy);

export const getBondPortNames = (policy: V1NodeNetworkConfigurationPolicy) => {
  const bondPorts = getBondPorts(policy);

  if (typeof bondPorts?.[0] === 'string') return bondPorts;

  return bondPorts?.map((port) => port?.name);
};

export const getBridgePortNames = (policy: V1NodeNetworkConfigurationPolicy) =>
  getBridgePorts(policy)?.map((port) => port?.name);

export const getOVNBridgeMapping = (policy: V1NodeNetworkConfigurationPolicy) =>
  getOVN(policy)?.[OVN_BRIDGE_MAPPINGS]?.[0];

export const getOVNLocalnet = (policy: V1NodeNetworkConfigurationPolicy) =>
  getOVNBridgeMapping(policy)?.localnet;

export const getOVNBridgeName = (policy: V1NodeNetworkConfigurationPolicy) =>
  getOVNBridgeMapping(policy)?.bridge;

export const getBondName = (policy: V1NodeNetworkConfigurationPolicy) => getBond(policy)?.name;

export const getBridgeName = (policy: V1NodeNetworkConfigurationPolicy) =>
  getBridgeInterface(policy)?.name;

export const getPolicyLocalnetNames = (policy: V1NodeNetworkConfigurationPolicy): string[] => {
  const bridgeMappings = getOVN(policy)?.[OVN_BRIDGE_MAPPINGS] || [];
  return bridgeMappings.map((mapping) => mapping?.localnet).filter(Boolean);
};

export const getUplinkConnectionOption = (policy: V1NodeNetworkConfigurationPolicy): string => {
  const bridgePorts = getBridgePortNames(policy);
  const bondPorts = getBondPortNames(policy);
  const bridgeName = getOVNBridgeName(policy);

  if (bridgeName === 'br-ex') return 'brex';
  if (bondPorts?.length > 0) return 'bonding_interface';
  if (bridgePorts?.length === 1) return 'single_device';
  return '';
};
