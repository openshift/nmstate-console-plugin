import { InterfaceType, V1NodeNetworkConfigurationPolicy } from '@types';
import { LINK_AGGREGATION } from '@utils/components/PolicyForm/PolicyWizard/utils/constants';

export const getPolicyInterface = (policy: V1NodeNetworkConfigurationPolicy) =>
  policy?.spec?.desiredState?.interfaces?.[0];

export const getMTU = (policy: V1NodeNetworkConfigurationPolicy) => getPolicyInterface(policy)?.mtu;

export const getInterfaceName = (policy: V1NodeNetworkConfigurationPolicy) =>
  getPolicyInterface(policy)?.name;

export const getBridgePorts = (policy: V1NodeNetworkConfigurationPolicy) =>
  getPolicyInterface(policy)?.bridge?.port || [];

export const getAggregationMode = (policy: V1NodeNetworkConfigurationPolicy) =>
  getPolicyInterface(policy)?.[LINK_AGGREGATION]?.mode;

export const getAggregationPorts = (policy: V1NodeNetworkConfigurationPolicy): string[] =>
  getPolicyInterface(policy)?.[LINK_AGGREGATION]?.port || [];

export const getPortNames = (policy: V1NodeNetworkConfigurationPolicy) => {
  const policyInterfaceType = getPolicyInterface(policy)?.type;
  if (policyInterfaceType === InterfaceType.OVS_BRIDGE)
    return getBridgePorts(policy)
      ?.map((port) => port.name)
      ?.join(', ');

  if (policyInterfaceType === InterfaceType.BOND) return getAggregationPorts(policy)?.join(', ');

  return [];
};
