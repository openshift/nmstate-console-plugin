import { V1NodeNetworkConfigurationPolicy } from '@kubevirt-ui/kubevirt-api/nmstate';

export const getOVNConfiguration = (policy: V1NodeNetworkConfigurationPolicy) =>
  policy?.spec?.desiredState?.ovn;

export const getNodeSelector = (policy: V1NodeNetworkConfigurationPolicy) =>
  policy?.spec?.nodeSelector;
