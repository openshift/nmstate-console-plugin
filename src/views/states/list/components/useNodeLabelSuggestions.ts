import { useMemo } from 'react';

import { IoK8sApiCoreV1Node } from '@kubevirt-ui/kubevirt-api/kubernetes/models';
import { useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';
import { getLabels } from '@utils/components/resources/selectors';
import { NodeModelGroupVersionKind } from 'src/console-models/NodeModel';

const useNodeLabelSuggestions = (): string[] => {
  const [nodes] = useK8sWatchResource<IoK8sApiCoreV1Node[]>({
    groupVersionKind: NodeModelGroupVersionKind,
    isList: true,
    namespaced: false,
  });

  return useMemo(() => {
    const keyValuePairs = new Set<string>();
    const keys = new Set<string>();

    nodes?.forEach((node) => {
      Object.entries(getLabels(node) ?? {}).forEach(([key, value]) => {
        keyValuePairs.add(`${key}=${value}`);
        keys.add(key);
      });
    });

    return [...keyValuePairs, ...keys].sort();
  }, [nodes]);
};

export default useNodeLabelSuggestions;
