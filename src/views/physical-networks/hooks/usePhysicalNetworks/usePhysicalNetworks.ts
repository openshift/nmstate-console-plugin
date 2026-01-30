import { useMemo } from 'react';

import { useNMStateTranslation } from '@utils/hooks/useNMStateTranslation';
import useNNCEs from '@utils/hooks/resources/NNCEs/useNNCEs';
import useNNCPs from '@utils/hooks/resources/NNCPs/useNNCPs';
import useWorkerNodes from '@utils/hooks/resources/Nodes/useWorkerNodes';

import { PhysicalNetworks } from '../../utils/types';

import { getPhysicalNetworks } from './utils/utils';

type UsePhysicalNetworks = () => {
  physicalNetworks: PhysicalNetworks;
  physicalNetworksLoaded: boolean;
};

const usePhysicalNetworks: UsePhysicalNetworks = () => {
  const { t } = useNMStateTranslation();
  const [nncps, nncpsLoaded] = useNNCPs();
  const [nnces, nncesLoaded] = useNNCEs();
  const [nodes, nodesLoaded] = useWorkerNodes();

  const physicalNetworks = useMemo(
    () => getPhysicalNetworks(nncps, nodes, nnces, t),
    [nncps, nodes, nnces, t],
  );

  return { physicalNetworks, physicalNetworksLoaded: nncpsLoaded && nncesLoaded && nodesLoaded };
};

export default usePhysicalNetworks;
