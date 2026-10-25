import { NodeNetworkConfigurationInterface } from '@kubevirt-ui-ext/kubevirt-api/nmstate';

export const isSTPEnabled = (policyInterface: NodeNetworkConfigurationInterface) =>
  policyInterface?.bridge?.options?.stp?.enabled === undefined ||
  policyInterface?.bridge?.options?.stp?.enabled;
