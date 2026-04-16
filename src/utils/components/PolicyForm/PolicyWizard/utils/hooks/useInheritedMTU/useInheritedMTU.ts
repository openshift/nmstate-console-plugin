import { V1NodeNetworkConfigurationPolicy } from '@kubevirt-ui/kubevirt-api/nmstate';
import { ConnectionOption } from '@utils/components/PolicyForm/PolicyWizard/utils/types';
import { getUplinkConnectionOption } from '@utils/components/PolicyForm/PolicyWizard/utils/utils';
import { getNodeSelector } from '@utils/resources/policies/getters';

import useNodeInterfaces from '../useNodeInterfaces/useNodeInterfaces';

import { getBrExMTU, getSelectedUplinkPortNames, getUplinkMTU } from './utils';

const useInheritedMTU = (policy: V1NodeNetworkConfigurationPolicy): number | undefined => {
  const { availableInterfaces, selectedNodeNNSResources } = useNodeInterfaces(
    getNodeSelector(policy),
  );

  if (getUplinkConnectionOption(policy) === ConnectionOption.BREX) {
    return getBrExMTU(selectedNodeNNSResources);
  }

  const portNames = getSelectedUplinkPortNames(policy);

  return portNames.length > 0 ? getUplinkMTU(portNames, availableInterfaces) : undefined;
};

export default useInheritedMTU;
