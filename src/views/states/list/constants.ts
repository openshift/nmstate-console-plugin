import { NodeNetworkStateModel } from '@models';
import { getResourceUrl } from '@utils/helpers';

export const baseListUrl = getResourceUrl({ model: NodeNetworkStateModel });

export const FILTER_TYPES = {
  MAC_ADDRESS: 'mac-address',
  INTERFACE_STATE: 'interface-state',
  INTERFACE_TYPE: 'interface-type',
  IP_FILTER: 'ip-filter',
  IP_ADDRESS: 'ip-address',
  LLDP: 'lldp',
  LLDP_NAME: 'lldp-name',
  LLDP_SYSTEM_NAME: 'lldp-system-name',
  NODE_LABEL: 'node-label',
} as const;

export const LLDP_ENABLED = 'enabled';
export const LLDP_DISABLED = 'disabled';

export type SelectedFilters = {
  [filter: string]: string[];
};
