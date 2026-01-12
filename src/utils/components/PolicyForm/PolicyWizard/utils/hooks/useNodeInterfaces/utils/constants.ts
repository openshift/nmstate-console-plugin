import { InterfaceType } from '@kubevirt-ui/kubevirt-api/nmstate';

export const GENEV_INTERFACE_PREFIX = 'genev_';

export const bridgeTypes = [
  InterfaceType.OVS_BRIDGE,
  InterfaceType.LINUX_BRIDGE,
  InterfaceType.BOND,
];
