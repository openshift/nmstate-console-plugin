import { V1NodeNetworkConfigurationPolicy } from '@types';

export const getOVNConfiguration = (policy: V1NodeNetworkConfigurationPolicy) =>
  policy?.spec?.desiredState?.ovn;
