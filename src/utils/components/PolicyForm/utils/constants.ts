import {
  InterfaceType,
  NodeNetworkConfigurationInterface,
  V1NodeNetworkConfigurationPolicy,
} from '@types';

export enum NETWORK_STATES {
  Up = 'up',
  Down = 'down',
  Absent = 'absent',
}

export const INTERFACE_TYPE_LABEL = {
  [InterfaceType.LINUX_BRIDGE]: 'Linux bridge',
  [InterfaceType.OVS_BRIDGE]: 'Open vSwitch bridge',
  [InterfaceType.BOND]: 'Bonding',
  [InterfaceType.ETHERNET]: 'Ethernet',
};

export const BOND_OPTIONS_KEYS = [
  'all_slaves_active',
  'arp_all_targets',
  'arp_interval',
  'arp_validate',
  'downdelay',
  'lp_interval',
  'miimon',
  'min_links',
  'packets_per_slave',
  'primary_reselect',
  'resend_igmp',
  'updelay',
  'use_carrier',
];

export const DEFAULT_PREFIX_LENGTH = 24;

export type onInterfaceChangeType = (
  policyInterface: NodeNetworkConfigurationInterface,
  policy: V1NodeNetworkConfigurationPolicy,
) => void;
