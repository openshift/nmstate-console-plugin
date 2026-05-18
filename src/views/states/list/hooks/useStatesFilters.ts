import { useMemo } from 'react';

import { IoK8sApiCoreV1Node } from '@kubevirt-ui/kubevirt-api/kubernetes/models';
import {
  NodeNetworkConfigurationInterface,
  V1beta1NodeNetworkState,
} from '@kubevirt-ui/kubevirt-api/nmstate';
import { useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';
import { useDataViewFilters } from '@patternfly/react-data-view';
import { isEmpty } from '@utils/helpers';
import { getInterfaces } from '@utils/resources/nns/getters';
import { NodeModelGroupVersionKind } from 'src/console-models/NodeModel';

import { FILTER_TYPES, LLDP_ENABLED, SelectedFilters } from '../constants';
import {
  matchNodeLabel,
  searchInterfaceByIP,
  searchInterfaceByLLDPName,
  searchInterfaceByLLDPSystemName,
  searchInterfaceByMAC,
} from '../utilts';

type InterfaceFilterFn = (val: string, iface: NodeNetworkConfigurationInterface) => boolean;

const TEXT_INTERFACE_FILTERS: Partial<Record<string, InterfaceFilterFn>> = {
  [FILTER_TYPES.IP_ADDRESS]: searchInterfaceByIP,
  [FILTER_TYPES.MAC_ADDRESS]: searchInterfaceByMAC,
  [FILTER_TYPES.LLDP_NAME]: searchInterfaceByLLDPName,
  [FILTER_TYPES.LLDP_SYSTEM_NAME]: searchInterfaceByLLDPSystemName,
};

const CHECKBOX_INTERFACE_FILTERS: Partial<Record<string, InterfaceFilterFn>> = {
  [FILTER_TYPES.LLDP]: (status, iface) =>
    status === LLDP_ENABLED ? Boolean(iface?.lldp?.enabled) : !iface?.lldp?.enabled,
  [FILTER_TYPES.INTERFACE_STATE]: (status, iface) => iface.state?.toLowerCase() === status,
  [FILTER_TYPES.INTERFACE_TYPE]: (type, iface) => iface.type === type,
  [FILTER_TYPES.IP_FILTER]: (ipType, iface) => !!iface[ipType],
};

export const INITIAL_FILTERS = {
  [FILTER_TYPES.IP_ADDRESS]: '' as string,
  [FILTER_TYPES.MAC_ADDRESS]: '' as string,
  [FILTER_TYPES.LLDP_NAME]: '' as string,
  [FILTER_TYPES.LLDP_SYSTEM_NAME]: '' as string,
  [FILTER_TYPES.NODE_LABEL]: '' as string,
  [FILTER_TYPES.LLDP]: [] as string[],
  [FILTER_TYPES.INTERFACE_STATE]: [] as string[],
  [FILTER_TYPES.INTERFACE_TYPE]: [] as string[],
  [FILTER_TYPES.IP_FILTER]: [] as string[],
};

export type StatesFilters = typeof INITIAL_FILTERS;

type UseStatesFiltersResult = {
  filters: StatesFilters;
  onSetFilters: (newFilters: Partial<StatesFilters>) => void;
  filteredData: V1beta1NodeNetworkState[];
  selectedFilters: SelectedFilters;
};

const useStatesFilters = (states: V1beta1NodeNetworkState[]): UseStatesFiltersResult => {
  const [nodes] = useK8sWatchResource<IoK8sApiCoreV1Node[]>({
    groupVersionKind: NodeModelGroupVersionKind,
    isList: true,
    namespaced: false,
  });

  const nodeLabelsMap = useMemo(() => {
    const map: Record<string, Record<string, string>> = {};
    nodes?.forEach((node) => {
      if (node.metadata?.name) {
        map[node.metadata.name] = node.metadata.labels || {};
      }
    });
    return map;
  }, [nodes]);

  const { filters, onSetFilters } = useDataViewFilters<StatesFilters>({
    initialFilters: INITIAL_FILTERS,
  });

  const filteredData = useMemo(() => {
    if (!states) return [];
    return states.filter((obj) => {
      const ifaces = getInterfaces(obj);
      const nodeName = obj.metadata?.name ?? '';
      const nodeLabels = nodeLabelsMap[nodeName] || {};

      const passesTextFilters = Object.entries(TEXT_INTERFACE_FILTERS).every(([key, fn]) => {
        const val = filters[key] as string;
        return !val || ifaces.some((iface) => fn(val, iface));
      });

      const passesNodeLabel =
        !filters[FILTER_TYPES.NODE_LABEL] ||
        matchNodeLabel(filters[FILTER_TYPES.NODE_LABEL], nodeLabels);

      const passesCheckboxFilters = Object.entries(CHECKBOX_INTERFACE_FILTERS).every(([key, fn]) => {
        const vals = filters[key] as string[];
        return isEmpty(vals) || vals.some((val) => ifaces.some((iface) => fn(val, iface)));
      });

      return passesTextFilters && passesNodeLabel && passesCheckboxFilters;
    });
  }, [states, filters, nodeLabelsMap]);

  const selectedFilters: SelectedFilters = useMemo(
    () =>
      Object.fromEntries(
        Object.entries(filters).map(([key, val]) => [
          key,
          Array.isArray(val) ? val : val ? [val] : [],
        ]),
      ),
    [filters],
  );

  return { filters, onSetFilters, filteredData, selectedFilters };
};

export default useStatesFilters;
