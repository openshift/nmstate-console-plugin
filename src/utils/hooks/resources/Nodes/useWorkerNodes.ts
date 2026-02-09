import { IoK8sApiCoreV1Node } from '@kubevirt-ui/kubevirt-api/kubernetes/models';
import { useK8sWatchResource, WatchK8sResult } from '@openshift-console/dynamic-plugin-sdk';

import { modelToGroupVersionKind } from '../../../../console-models/modelUtils';
import NodeModel from '../../../../console-models/NodeModel';

type UseWorkerNodes = () => WatchK8sResult<IoK8sApiCoreV1Node[]>;

const useWorkerNodes: UseWorkerNodes = () => {
  const [nodes, loaded, error] = useK8sWatchResource<IoK8sApiCoreV1Node[]>({
    groupVersionKind: modelToGroupVersionKind(NodeModel),
    isList: true,
    namespaced: false,
  });

  // Filter to worker nodes only
  const workerNodes = nodes?.filter(
    (node) => node?.metadata?.labels?.['node-role.kubernetes.io/worker'] === '',
  );

  return [workerNodes, loaded, error];
};

export default useWorkerNodes;
