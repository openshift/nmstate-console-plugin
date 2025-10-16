import {
  NodeNetworkConfigurationInterface,
  V1beta1NodeNetworkState,
} from '@kubevirt-ui/kubevirt-api/nmstate';

export const getInterfaces = (nns: V1beta1NodeNetworkState): NodeNetworkConfigurationInterface[] =>
  nns?.status?.currentState?.interfaces;
