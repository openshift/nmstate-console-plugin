import { IoK8sApiCoreV1Node } from '@kubevirt-ui/kubevirt-api/kubernetes/models';
import { V1NodeNetworkConfigurationPolicy } from '@kubevirt-ui/kubevirt-api/nmstate';
import { useK8sWatchResource, WatchK8sResult } from '@openshift-console/dynamic-plugin-sdk';
import { getNodeSelector } from '@utils/resources/policies/getters';

import { NodeModelGroupVersionKind } from '../../../../../../console-models/NodeModel';

type UseNNCPNodes = (
  policy: V1NodeNetworkConfigurationPolicy,
) => WatchK8sResult<IoK8sApiCoreV1Node[]>;

const useNNCPNodes: UseNNCPNodes = (policy) =>
  useK8sWatchResource<IoK8sApiCoreV1Node[]>({
    groupVersionKind: NodeModelGroupVersionKind,
    isList: true,
    selector: {
      matchLabels: getNodeSelector(policy),
    },
  });

export default useNNCPNodes;
