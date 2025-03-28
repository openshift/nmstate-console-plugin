import { useMemo } from 'react';
import { NodeModelGroupVersionKind } from 'src/console-models/NodeModel';

import { IoK8sApiCoreV1Node } from '@kubevirt-ui/kubevirt-api/kubernetes/models';
import { NodeNetworkConfigurationPolicyModelGroupVersionKind } from '@models';
import { useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';
import {
  NodeNetworkConfigurationInterface,
  V1beta1NodeNetworkConfigurationPolicy,
  V1beta1NodeNetworkState,
} from '@types';
import { isEmpty } from '@utils/helpers';

import { isPolicyAppliedInNode } from '../utils';

const useSelectedResources = (
  selectedId: string,
  states: V1beta1NodeNetworkState[],
): {
  selectedState?: V1beta1NodeNetworkState;
  selectedPolicy?: V1beta1NodeNetworkConfigurationPolicy;
  selectedInterface?: NodeNetworkConfigurationInterface;
} => {
  const [policies] = useK8sWatchResource<V1beta1NodeNetworkConfigurationPolicy[]>({
    groupVersionKind: NodeNetworkConfigurationPolicyModelGroupVersionKind,
    isList: true,
    namespaced: false,
  });

  const [nodes] = useK8sWatchResource<IoK8sApiCoreV1Node[]>({
    groupVersionKind: NodeModelGroupVersionKind,
    isList: true,
    namespaced: false,
  });

  return useMemo(() => {
    if (isEmpty(selectedId)) return { selectedState: null, selectedPolicy: null };

    const [selectedNNSName, selectedInterfaceName] = selectedId.split('~');
    const selectedNode = nodes?.find((node) => node.metadata.name === selectedNNSName);

    const selectedPolicy = policies?.find(
      (policy) =>
        isPolicyAppliedInNode(policy, selectedNode) &&
        policy.spec?.desiredState?.interfaces?.find(
          (iface) => iface.name === selectedInterfaceName,
        ),
    );

    const selectedState = states?.find((state) => state.metadata.name === selectedNNSName);

    const selectedInterface = selectedState?.status?.currentState?.interfaces?.find(
      (iface) => iface.name === selectedInterfaceName,
    );

    return { selectedState, selectedPolicy, selectedInterface };
  }, [selectedId, states, policies, nodes]);
};

export default useSelectedResources;
