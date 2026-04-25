import { useLocation, useNavigate } from 'react-router';

import {
  NodeNetworkConfigurationInterface,
  V1beta1NodeNetworkState,
} from '@kubevirt-ui/kubevirt-api/nmstate';

import { baseListUrl } from '../constants';

const useDrawerInterface = () => {
  const navigate = useNavigate();
  const { search } = useLocation();

  const params = new URLSearchParams(search);

  const selectedInterfaceName = params.get('selectedInterface') as string;
  const selectedInterfaceType = params.get('selectedInterfaceType') as string;
  const selectedStateName = params.get('selectedState') as string;

  return {
    selectedInterfaceName,
    selectedInterfaceType,
    selectedStateName,
    setSelectedInterfaceName: (
      nodeNetworkState?: V1beta1NodeNetworkState,
      nodeNetworkInterface?: NodeNetworkConfigurationInterface,
    ) => {
      if (!nodeNetworkInterface) return navigate(baseListUrl);

      const query = new URLSearchParams({
        selectedInterface: nodeNetworkInterface.name,
        selectedInterfaceType: nodeNetworkInterface.type,
        selectedState: nodeNetworkState?.metadata?.name,
      });

      navigate(`${baseListUrl}?${query.toString()}`);
    },
  };
};

export default useDrawerInterface;
