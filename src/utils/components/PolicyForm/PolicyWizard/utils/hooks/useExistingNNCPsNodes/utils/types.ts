import { IoK8sApiCoreV1Node } from '@kubevirt-ui/kubevirt-api/kubernetes/models';

export type NNCPNodeSelectorMap = Record<string, Record<string, string>>;

export type NNCPNodesData = {
  nodeSelector: Record<string, string>;
  nodes: IoK8sApiCoreV1Node[];
};

export type NNCPNodesDetails = {
  loaded: boolean;
  loadError: string;
  nncpNodesData: Record<string, NNCPNodesData>;
};
