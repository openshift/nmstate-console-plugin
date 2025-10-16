import {
  CHASSIS_ID,
  IEE_802_1_VLANS,
  NodeNetworkConfigurationInterfaceLLDPNeighbor,
  PORT_ID,
  SYSTEM_DESCRIPTION,
  SYSTEM_NAME,
} from '@kubevirt-ui/kubevirt-api/nmstate';

export const getNeighborInformation = (
  neighbor: NodeNetworkConfigurationInterfaceLLDPNeighbor,
  property: string,
) => neighbor.find((n) => n[property])?.[property];

export const getDescription = (
  neighbor: NodeNetworkConfigurationInterfaceLLDPNeighbor,
  property: string,
) => neighbor.find((n) => n[property])?._description;

export const getPortId = (neighbor: NodeNetworkConfigurationInterfaceLLDPNeighbor) =>
  getNeighborInformation(neighbor, PORT_ID);

export const getChassisId = (neighbor: NodeNetworkConfigurationInterfaceLLDPNeighbor) =>
  getNeighborInformation(neighbor, CHASSIS_ID);

export const getSystemName = (neighbor: NodeNetworkConfigurationInterfaceLLDPNeighbor) =>
  getNeighborInformation(neighbor, SYSTEM_NAME);

export const getSystemDescription = (neighbor: NodeNetworkConfigurationInterfaceLLDPNeighbor) =>
  getNeighborInformation(neighbor, SYSTEM_DESCRIPTION);

export const getIee8021Vlans = (neighbor: NodeNetworkConfigurationInterfaceLLDPNeighbor) =>
  getNeighborInformation(neighbor, IEE_802_1_VLANS);
