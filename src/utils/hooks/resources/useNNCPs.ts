import { useK8sWatchResource, WatchK8sResult } from '@openshift-console/dynamic-plugin-sdk';
import { V1NodeNetworkConfigurationPolicy } from '@types';

import { modelToGroupVersionKind } from '../../../console-models/modelUtils';
import NodeNetworkConfigurationPolicyModel from '../../../console-models/NodeNetworkConfigurationPolicyModel';

type UseNNCPs = () => WatchK8sResult<V1NodeNetworkConfigurationPolicy[]>;

const useNNCPs: UseNNCPs = () =>
  useK8sWatchResource<V1NodeNetworkConfigurationPolicy[]>({
    groupVersionKind: modelToGroupVersionKind(NodeNetworkConfigurationPolicyModel),
    isList: true,
    namespaced: false,
  });

export default useNNCPs;
