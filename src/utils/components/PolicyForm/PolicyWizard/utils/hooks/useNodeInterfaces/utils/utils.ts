import { intersectionWith } from 'lodash';

import {
  InterfaceType,
  NodeNetworkConfigurationInterface,
  V1beta1NodeNetworkState,
} from '@kubevirt-ui/kubevirt-api/nmstate';
import { getInterfaces } from '@utils/resources/nns/getters';
import { getEthernetInterfaces } from '@utils/resources/nns/utils';

const bridgeTypes = [InterfaceType.OVS_BRIDGE, InterfaceType.LINUX_BRIDGE, InterfaceType.BOND];

export const getExistingInterfaceNames = (nodeNetworkStates: V1beta1NodeNetworkState[]) => {
  const uniqueInterfaceNames = nodeNetworkStates.reduce((acc, nns) => {
    const interfaceList = getInterfaces(nns);
    interfaceList.forEach((iface) => acc.add(iface?.name));
    return acc;
  }, new Set<string>());

  return [...uniqueInterfaceNames];
};

const getUsedPortNamesForNode = (nns: V1beta1NodeNetworkState) => {
  const interfaces = getInterfaces(nns);
  return interfaces.reduce((acc, iface) => {
    if (bridgeTypes.includes(iface?.type)) {
      const ports = iface?.bridge?.port?.map((port) => port?.name);
      acc = [...acc, ...ports];
    }

    return acc;
  }, []);
};

export const getAvailableInterfacesForNode = (nns: V1beta1NodeNetworkState) => {
  const usedPortNames = getUsedPortNamesForNode(nns);
  const allEthernetInterfaces = getEthernetInterfaces(nns);
  return allEthernetInterfaces?.filter((iface) => usedPortNames.includes(iface?.name));
};

const nnsInterfaceComparator = (
  ifaceA: NodeNetworkConfigurationInterface,
  ifaceB: NodeNetworkConfigurationInterface,
) => ifaceA.name === ifaceB.name;

export const getAvailableInterfacesForNodes = (nodeNetworkStates: V1beta1NodeNetworkState[]) => {
  const portsByNode = nodeNetworkStates.map((nns) => getAvailableInterfacesForNode(nns));
  return intersectionWith(...portsByNode, nnsInterfaceComparator);
};
