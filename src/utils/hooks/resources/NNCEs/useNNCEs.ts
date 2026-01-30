import { V1beta1NodeNetworkConfigurationEnactment } from '@kubevirt-ui/kubevirt-api/nmstate';
import { useK8sWatchResource, WatchK8sResult } from '@openshift-console/dynamic-plugin-sdk';

import { modelToGroupVersionKind } from '../../../../console-models/modelUtils';
import NodeNetworkConfigurationEnactmentModel from '../../../../console-models/NodeNetworkConfigurationEnactmentModel';

type UseNNCEs = () => WatchK8sResult<V1beta1NodeNetworkConfigurationEnactment[]>;

const useNNCEs: UseNNCEs = () =>
  useK8sWatchResource<V1beta1NodeNetworkConfigurationEnactment[]>({
    groupVersionKind: modelToGroupVersionKind(NodeNetworkConfigurationEnactmentModel),
    isList: true,
    namespaced: false,
  });

export default useNNCEs;
