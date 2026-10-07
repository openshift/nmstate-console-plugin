import { NodeNetworkConfigurationInterface } from '@kubevirt-ui/kubevirt-api/nmstate';
import { ensureArray } from '@utils/helpers';

export const getIPV4Address = (iface: NodeNetworkConfigurationInterface) =>
  iface?.ipv4?.address?.[0]?.ip;

export const getIPV6Address = (iface: NodeNetworkConfigurationInterface) =>
  iface?.ipv6?.address?.[0]?.ip;

export const getPorts = (iface: NodeNetworkConfigurationInterface) => {
  const bridgePorts = ensureArray(iface?.bridge?.port).map((port) => port.name);
  const bondPorts = ensureArray<string>(iface?.['link-aggregation']?.port);
  return [...bridgePorts, ...bondPorts].sort();
};
