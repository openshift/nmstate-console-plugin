import { IoK8sApiCoreV1Node } from '@kubevirt-ui/kubevirt-api/kubernetes/models';
import {
  NodeNetworkConfigurationInterface,
  V1beta1NodeNetworkState,
} from '@kubevirt-ui/kubevirt-api/nmstate';

export type NodeInterfacesResources = {
  nodes: IoK8sApiCoreV1Node[];
  nns: V1beta1NodeNetworkState[];
};

export type NodeInterfacesData = {
  availableInterfaces: NodeNetworkConfigurationInterface[];
  existingInterfaceNames: string[];
  loaded: boolean;
};
