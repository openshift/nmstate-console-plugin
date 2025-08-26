import { NodeNetworkConfigurationInterface } from '@types';

export const isSTPEnabled = (policyInterface: NodeNetworkConfigurationInterface) =>
  policyInterface?.bridge?.options?.stp?.enabled === undefined ||
  policyInterface?.bridge?.options?.stp?.enabled;
