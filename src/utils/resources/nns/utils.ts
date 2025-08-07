import { InterfaceType, NodeNetworkConfigurationInterface, V1beta1NodeNetworkState } from '@types';
import { getInterfaces } from '@utils/resources/nns/getters';

export const getEthernetInterfaces = (
  nns: V1beta1NodeNetworkState,
): NodeNetworkConfigurationInterface[] =>
  getInterfaces(nns).filter(
    (iface: NodeNetworkConfigurationInterface) => iface?.type === InterfaceType.ETHERNET,
  );
