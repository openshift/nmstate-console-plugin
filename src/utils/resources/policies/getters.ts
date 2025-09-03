import { V1NodeNetworkConfigurationPolicy } from '@types';

export const getOVNConfiguration = (policy: V1NodeNetworkConfigurationPolicy) =>
  policy?.spec?.desiredState?.ovn;

export const getNodeSelector = (policy: V1NodeNetworkConfigurationPolicy) =>
  policy?.spec?.nodeSelector;
