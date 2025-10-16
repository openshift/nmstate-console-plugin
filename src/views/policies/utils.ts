import {
  InterfaceType,
  NodeNetworkConfigurationInterface,
  V1NodeNetworkConfigurationPolicy,
} from '@kubevirt-ui/kubevirt-api/nmstate';

export const isPolicySupported = (policy: V1NodeNetworkConfigurationPolicy) => {
  return policy?.spec?.desiredState?.interfaces?.find(
    (policyInterface: NodeNetworkConfigurationInterface) =>
      [InterfaceType.BOND, InterfaceType.ETHERNET, InterfaceType.LINUX_BRIDGE].includes(
        policyInterface.type,
      ),
  );
};
