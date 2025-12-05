import {
  NodeNetworkConfigurationInterface,
  V1beta1NodeNetworkState,
} from '@kubevirt-ui/kubevirt-api/nmstate';

export const getInterfaces = (nns: V1beta1NodeNetworkState): NodeNetworkConfigurationInterface[] =>
  nns?.status?.currentState?.interfaces;

export const getNodeName = (nns: V1beta1NodeNetworkState) =>
  nns?.metadata?.ownerReferences?.[0]?.name;
