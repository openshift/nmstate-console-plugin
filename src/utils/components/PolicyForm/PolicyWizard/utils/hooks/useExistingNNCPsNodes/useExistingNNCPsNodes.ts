import { IoK8sApiCoreV1Node } from '@kubevirt-ui/kubevirt-api/kubernetes/models';
import { useK8sWatchResources } from '@openshift-console/dynamic-plugin-sdk';
import { NNCPNodesDetails } from '@utils/components/PolicyForm/PolicyWizard/utils/hooks/useExistingNNCPsNodes/utils/types';
import {
  getNodeResources,
  getNodeSelectorsByNNCP,
} from '@utils/components/PolicyForm/PolicyWizard/utils/hooks/useExistingNNCPsNodes/utils/utils';
import useNNCPs from '@utils/hooks/resources/NNCPs/useNNCPs';

type UseExistingNNCPsNodes = () => NNCPNodesDetails;

const useExistingNNCPsNodes: UseExistingNNCPsNodes = () => {
  const [nncps] = useNNCPs();
  const nncpNodeSelectorMap = getNodeSelectorsByNNCP(nncps);
  const nncpNodesResults = useK8sWatchResources<Record<string, IoK8sApiCoreV1Node[]>>(
    getNodeResources(nncpNodeSelectorMap),
  );

  return Object.entries(nncpNodesResults).reduce(
    (acc: NNCPNodesDetails, [name, results]) => {
      const { data, loaded, loadError } = results;
      acc.nncpNodesData[name] = {
        nodeSelector: nncpNodeSelectorMap[name],
        nodes: data,
      };
      acc.loaded = acc.loaded && loaded;
      acc.loadError = !acc?.loadError && loadError;

      return acc;
    },
    {
      nncpNodesData: {},
      loaded: false,
      loadError: undefined,
    } as NNCPNodesDetails,
  );
};

export default useExistingNNCPsNodes;
