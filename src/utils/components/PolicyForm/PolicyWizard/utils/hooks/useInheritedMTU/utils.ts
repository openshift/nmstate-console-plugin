import {
  InterfaceType,
  NodeNetworkConfigurationInterface,
  V1beta1NodeNetworkState,
  V1NodeNetworkConfigurationPolicy,
} from '@kubevirt-ui/kubevirt-api/nmstate';
import {
  DEFAULT_OVN_BRIDGE_NAME,
  DEFAULT_OVS_INTERFACE_NAME,
} from '@utils/components/PolicyForm/PolicyWizard/utils/constants';
import { ConnectionOption } from '@utils/components/PolicyForm/PolicyWizard/utils/types';
import { getUplinkConnectionOption } from '@utils/components/PolicyForm/PolicyWizard/utils/utils';
import { getInterfaces } from '@utils/resources/nns/getters';
import { getBondPortNames, getBridgePorts } from '@utils/resources/policies/selectors';

const getValidMTUs = (mtus: (number | undefined)[]): number[] =>
  mtus.filter((mtu): mtu is number => mtu != null);

const minMTU = (mtus: number[]): number | undefined =>
  mtus.length > 0 ? Math.min(...mtus) : undefined;

export const getBrExMTU = (nodeNetworkStates: V1beta1NodeNetworkState[]): number | undefined => {
  const mtus = getValidMTUs(
    nodeNetworkStates?.map((nns) => {
      const brExInterface = getInterfaces(nns)?.find(
        (iface) =>
          iface?.name === DEFAULT_OVN_BRIDGE_NAME && iface?.type === InterfaceType.OVS_INTERFACE,
      );
      return brExInterface?.mtu;
    }),
  );

  return minMTU(mtus);
};

export const getSelectedUplinkPortNames = (policy: V1NodeNetworkConfigurationPolicy): string[] => {
  const connectionOption = getUplinkConnectionOption(policy);

  if (connectionOption === ConnectionOption.SINGLE_DEVICE) {
    const portName = getBridgePorts(policy)?.filter(
      (port) => port.name !== DEFAULT_OVS_INTERFACE_NAME,
    )?.[0]?.name;
    return portName ? [portName] : [];
  }

  if (connectionOption === ConnectionOption.BONDING_INTERFACE) {
    return getBondPortNames(policy) || [];
  }

  return [];
};

export const getUplinkMTU = (
  portNames: string[],
  availableInterfaces: NodeNetworkConfigurationInterface[],
): number | undefined => {
  const mtus = getValidMTUs(
    portNames.map((name) => availableInterfaces?.find((iface) => iface.name === name)?.mtu),
  );

  return minMTU(mtus);
};
