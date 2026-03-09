import {
  NodeNetworkConfigurationInterface,
  V1NodeNetworkConfigurationPolicy,
} from '@kubevirt-ui/kubevirt-api/nmstate';

export const getInterfaceToShow = (
  policy: V1NodeNetworkConfigurationPolicy,
  interfaceName: string,
) =>
  policy?.spec?.desiredState?.interfaces?.find(
    (policyInterface) => policyInterface.name === interfaceName,
  ) || (policy?.spec?.desiredState?.interfaces?.[0] as NodeNetworkConfigurationInterface);
