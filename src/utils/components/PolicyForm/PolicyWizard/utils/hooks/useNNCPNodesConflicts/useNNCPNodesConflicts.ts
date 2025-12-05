import { intersection } from 'lodash';

import { V1NodeNetworkConfigurationPolicy } from '@kubevirt-ui/kubevirt-api/nmstate';
import useExistingNNCPsNodes from '@utils/components/PolicyForm/PolicyWizard/utils/hooks/useExistingNNCPsNodes/useExistingNNCPsNodes';
import useNNCPNodes from '@utils/components/PolicyForm/PolicyWizard/utils/hooks/useNNCPNodes';
import { NNCPNodeConflict } from '@utils/components/PolicyForm/PolicyWizard/utils/hooks/useNNCPNodesConflicts/utils/types';
import { getNodeNames } from '@utils/components/PolicyForm/PolicyWizard/utils/hooks/useNNCPNodesConflicts/utils/utils';
import { isEmpty } from '@utils/helpers';

type UseNNCPNodesConflicts = (policy: V1NodeNetworkConfigurationPolicy) => NNCPNodeConflict[];

const useNNCPNodesConflicts: UseNNCPNodesConflicts = (policy) => {
  const { nncpNodesData } = useExistingNNCPsNodes();
  const [policyNodes] = useNNCPNodes(policy);

  return Object.entries(nncpNodesData).map(([name, nodesData]) => {
    const nodesIntersection = intersection(
      getNodeNames(policyNodes),
      getNodeNames(nodesData?.nodes),
    );
    if (!isEmpty(nodesIntersection))
      return { name, nodeSelector: nncpNodesData[name]?.nodeSelector };
  });
};

export default useNNCPNodesConflicts;
