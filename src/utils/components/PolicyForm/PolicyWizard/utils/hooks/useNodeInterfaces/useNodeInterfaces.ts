import { NodeNetworkStateModelGroupVersionKind } from '@models';
import { Selector, useK8sWatchResources } from '@openshift-console/dynamic-plugin-sdk';
import {
  getAvailableInterfacesForNodes,
  getExistingInterfaceNames,
} from '@utils/components/PolicyForm/PolicyWizard/utils/hooks/useNodeInterfaces/utils/utils';
import { getName } from '@utils/components/resources/selectors';
import { getNodeName } from '@utils/resources/nns/getters';

import { NodeModelGroupVersionKind } from '../../../../../../../console-models/NodeModel';

import { NodeInterfacesData, NodeInterfacesResources } from './utils/types';

type UseNodeInterfaces = (nodeSelector: Selector) => NodeInterfacesData;

const useNodeInterfaces: UseNodeInterfaces = (nodeSelector) => {
  const data = useK8sWatchResources<NodeInterfacesResources>({
    nodes: {
      groupVersionKind: NodeModelGroupVersionKind,
      isList: true,
      selector: nodeSelector,
    },
    nns: {
      groupVersionKind: NodeNetworkStateModelGroupVersionKind,
      isList: true,
    },
  });

  const selectedNodeNames = data?.nodes?.data?.map((node) => getName(node));
  const nnsLoaded = data?.nns?.loaded;
  const nnsResources = nnsLoaded ? data.nns.data : [];
  const selectedNodeNNSResources = nnsResources?.filter((nns) =>
    selectedNodeNames.includes(getNodeName(nns)),
  );

  const availableInterfaces = getAvailableInterfacesForNodes(selectedNodeNNSResources);
  const existingInterfaceNames = getExistingInterfaceNames(nnsResources);

  return { availableInterfaces, existingInterfaceNames, loaded: nnsLoaded && data?.nodes?.loaded };
};

export default useNodeInterfaces;
