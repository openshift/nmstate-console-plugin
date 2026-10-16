import {
  InterfaceType,
  NodeNetworkConfigurationInterface,
  V1NodeNetworkConfigurationPolicy,
} from '@types';
import { isEmpty } from '@utils/helpers';
import { OVN_BRIDGE_MAPPINGS } from '@utils/ovn/constants';

const SUPPORTED_INTERFACE_TYPES = [
  InterfaceType.BOND,
  InterfaceType.ETHERNET,
  InterfaceType.LINUX_BRIDGE,
  InterfaceType.OVS_BRIDGE,
];

export const isPolicySupported = (policy: V1NodeNetworkConfigurationPolicy) => {
  const hasSupportedInterface = policy?.spec?.desiredState?.interfaces?.some(
    (policyInterface: NodeNetworkConfigurationInterface) =>
      SUPPORTED_INTERFACE_TYPES.includes(policyInterface.type),
  );
  const hasOvnBridgeMapping = !isEmpty(policy?.spec?.desiredState?.ovn?.[OVN_BRIDGE_MAPPINGS]);

  return Boolean(hasSupportedInterface || hasOvnBridgeMapping);
};
