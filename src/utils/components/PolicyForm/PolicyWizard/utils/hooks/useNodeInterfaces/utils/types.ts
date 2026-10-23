import type { IoK8sApiCoreV1Node } from '@kubevirt-ui-ext/kubevirt-api/kubernetes';
import {
  NodeNetworkConfigurationInterface,
  V1beta1NodeNetworkState,
} from '@kubevirt-ui-ext/kubevirt-api/nmstate';

export type NodeInterfacesResources = {
  nodes: IoK8sApiCoreV1Node[];
  nns: V1beta1NodeNetworkState[];
};

export type NodeInterfacesData = {
  availableInterfaces: NodeNetworkConfigurationInterface[];
  existingInterfaceNames: string[];
  loaded: boolean;
  selectedNodeNNSResources: V1beta1NodeNetworkState[];
};
