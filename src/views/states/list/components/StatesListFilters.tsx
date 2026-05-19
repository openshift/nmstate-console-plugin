import React, { FC } from 'react';

import { InterfaceType } from '@kubevirt-ui/kubevirt-api/nmstate';
import { DataViewCheckboxFilter, DataViewTextFilter } from '@patternfly/react-data-view';

import { DataViewFilters } from './patternfly-data-view';
import { useNMStateTranslation } from '@utils/hooks/useNMStateTranslation';

import { FILTER_TYPES, LLDP_DISABLED, LLDP_ENABLED } from '../constants';
import { INITIAL_FILTERS, StatesFilters } from '../hooks/useStatesFilters';

import NodeLabelSearchFilter from './NodeLabelSearchFilter';

type StatesListFiltersProps = {
  filters: StatesFilters;
  onFiltersChange: (newValues: Partial<StatesFilters>) => void;
};

const StatesListFilters: FC<StatesListFiltersProps> = ({ filters, onFiltersChange }) => {
  const { t } = useNMStateTranslation();

  return (
    <DataViewFilters<StatesFilters>
      onChange={(_filterId, newValues) => onFiltersChange(newValues)}
      values={filters}
      data-test="states-list-filters"
    >
      <DataViewTextFilter
        filterId={FILTER_TYPES.IP_ADDRESS}
        title={t('IP address')}
        placeholder={t('Search by IP address...')}
        data-test="states-list-filters-ip-address"
      />
      <DataViewTextFilter
        filterId={FILTER_TYPES.MAC_ADDRESS}
        title={t('MAC address')}
        placeholder={t('Search by MAC address...')}
        data-test="states-list-filters-mac-address"
      />
      <DataViewTextFilter
        filterId={FILTER_TYPES.LLDP_NAME}
        title={t('LLDP VLAN name')}
        placeholder={t('Search by VLAN name...')}
        data-test="states-list-filters-lldp-name"
      />
      <DataViewTextFilter
        filterId={FILTER_TYPES.LLDP_SYSTEM_NAME}
        title={t('LLDP system name')}
        placeholder={t('Search by LLDP system name...')}
        data-test="states-list-filters-lldp-system-name"
      />
      <DataViewCheckboxFilter
        filterId={FILTER_TYPES.LLDP}
        title={t('LLDP')}
        data-test="states-list-filters-lldp"
        options={[
          { label: t('Enabled'), value: LLDP_ENABLED },
          { label: t('Disabled'), value: LLDP_DISABLED },
        ]}
      />
      <DataViewCheckboxFilter
        filterId={FILTER_TYPES.INTERFACE_STATE}
        title={t('Interface state')}
        data-test="states-list-filters-interface-state"
        options={[
          { label: t('Up'), value: 'up' },
          { label: t('Down'), value: 'down' },
        ]}
      />
      <DataViewCheckboxFilter
        filterId={FILTER_TYPES.INTERFACE_TYPE}
        title={t('Interface type')}
        data-test="states-list-filters-interface-type"
        options={[
          InterfaceType.OVS_BRIDGE,
          InterfaceType.OVS_INTERFACE,
          InterfaceType.BOND,
          InterfaceType.ETHERNET,
          InterfaceType.LINUX_BRIDGE,
        ].map((type) => ({ label: type, value: type }))}
      />
      <DataViewCheckboxFilter
        filterId={FILTER_TYPES.IP_FILTER}
        title={t('IP')}
        data-test="states-list-filters-ip-filter"
        options={[
          { label: t('IPv4'), value: 'ipv4' },
          { label: t('IPv6'), value: 'ipv6' },
        ]}
      />
      <NodeLabelSearchFilter
        filterId={FILTER_TYPES.NODE_LABEL}
        title={t('Node label')}
        values={filters[FILTER_TYPES.NODE_LABEL] as string[]}
        onAdd={(label) =>
          onFiltersChange({
            [FILTER_TYPES.NODE_LABEL]: [...(filters[FILTER_TYPES.NODE_LABEL] as string[]), label],
          })
        }
        onRemove={(label) =>
          onFiltersChange({
            [FILTER_TYPES.NODE_LABEL]: (filters[FILTER_TYPES.NODE_LABEL] as string[]).filter(
              (l) => l !== label,
            ),
          })
        }
        onClearAll={() =>
          onFiltersChange({
            [FILTER_TYPES.NODE_LABEL]: INITIAL_FILTERS[FILTER_TYPES.NODE_LABEL],
          })
        }
      />
    </DataViewFilters>
  );
};

export default StatesListFilters;
