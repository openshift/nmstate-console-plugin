import type { IoK8sApiCoreV1Node } from '@kubevirt-ui-ext/kubevirt-api/kubernetes';

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
