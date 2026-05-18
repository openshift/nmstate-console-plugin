import React, { FC, useCallback, useState } from 'react';
import { useNavigate } from 'react-router';
import { useNMStateTranslation } from 'src/utils/hooks/useNMStateTranslation';

import { V1beta1NodeNetworkState } from '@kubevirt-ui/kubevirt-api/nmstate';
import { NodeNetworkStateModel, NodeNetworkStateModelGroupVersionKind } from '@models';
import {
  ListPageBody,
  ListPageHeader,
  useK8sWatchResource,
} from '@openshift-console/dynamic-plugin-sdk';
import { Button, Icon, Pagination, ToolbarItem } from '@patternfly/react-core';
import { DataView, DataViewToolbar, useDataViewPagination } from '@patternfly/react-data-view';
import { TopologyIcon } from '@patternfly/react-icons';
import { Table, TableGridBreakpoint, Th, Thead, Tr } from '@patternfly/react-table';
import { getName } from '@utils/components/resources/selectors';
import { isEmpty } from '@utils/helpers';
import { paginationDefaultValues } from '@utils/hooks/usePagination/utils/constants';

import InterfaceDrawer from './components/InterfaceDrawer/InterfaceDrawer';
import NNStateEmptyState from './components/NNStateEmptyState';
import NodeLabelSearchFilter from './components/NodeLabelSearchFilter';
import StateRow from './components/StateRow';
import StatesListFilters from './components/StatesListFilters';
import StatusBox from './components/StatusBox';
import useDrawerInterface from './hooks/useDrawerInterface';
import useStateColumns, { COLUMN_NAME_ID } from './hooks/useStateColumns';
import useStatesFilters, { INITIAL_FILTERS, StatesFilters } from './hooks/useStatesFilters';
import useStatesSort from './hooks/useStatesSort';
import { FILTER_TYPES } from './constants';

const StatesList: FC = () => {
  const { t } = useNMStateTranslation();
  const navigate = useNavigate();
  const {
    selectedInterfaceName,
    selectedStateName,
    selectedInterfaceType,
    setSelectedInterfaceName,
  } = useDrawerInterface();

  const onClose = useCallback(() => {
    setSelectedInterfaceName();
  }, []);

  const [expandAll, setExpandAll] = useState(false);

  const [states, statesLoaded, statesError] = useK8sWatchResource<V1beta1NodeNetworkState[]>({
    groupVersionKind: NodeNetworkStateModelGroupVersionKind,
    isList: true,
    namespaced: false,
  });

  const { filters, onSetFilters, filteredData, selectedFilters } = useStatesFilters(states);
  const { sortedStates, nameSortParams } = useStatesSort(filteredData);
  const { onPerPageSelect, onSetPage, page, perPage } = useDataViewPagination({ perPage: 15 });

  const activeColumns = useStateColumns();

  const selectedState = states?.find((state) => state.metadata.name === selectedStateName);
  const selectedInterface = selectedState?.status?.currentState?.interfaces?.find(
    (iface) => iface.name === selectedInterfaceName && iface.type === selectedInterfaceType,
  );

  const paginatedData = sortedStates.slice((page - 1) * perPage, page * perPage);

  const onFiltersChange = (newValues: Partial<StatesFilters>) => {
    onSetFilters(newValues);
    onSetPage(undefined, 1);
  };

  return (
    <>
      <ListPageHeader title={t(NodeNetworkStateModel.label)}>
        {!isEmpty(states) && (
          <Button
            icon={
              <Icon>
                <TopologyIcon />
              </Icon>
            }
            isInline
            variant="plain"
            onClick={() => navigate('/node-network-configuration')}
          />
        )}
      </ListPageHeader>
      <ListPageBody>
        <StatusBox loaded={statesLoaded} error={statesError}>
          <DataView>
            <DataViewToolbar
              filters={<StatesListFilters filters={filters} onFiltersChange={onFiltersChange} />}
              actions={
                <Button onClick={() => setExpandAll(!expandAll)}>
                  {expandAll ? t('Collapse all') : t('Expand all')}
                </Button>
              }
              pagination={
                <Pagination
                  onPerPageSelect={onPerPageSelect}
                  onSetPage={onSetPage}
                  itemCount={sortedStates?.length}
                  page={page}
                  perPage={perPage}
                  perPageOptions={paginationDefaultValues}
                />
              }
            >
            </DataViewToolbar>
            {sortedStates?.length ? (
              <Table gridBreakPoint={TableGridBreakpoint.none} role="presentation">
                <Thead>
                  <Tr>
                    {activeColumns.map((column) => (
                      <Th
                        key={column.id}
                        {...column?.props}
                        sort={column.id === COLUMN_NAME_ID ? nameSortParams : null}
                      >
                        {column.title}
                      </Th>
                    ))}
                  </Tr>
                </Thead>
                {paginatedData.map((nnstate, index) => (
                  <StateRow
                    key={getName(nnstate)}
                    obj={nnstate}
                    activeColumnIDs={new Set(activeColumns.map(({ id }) => id))}
                    rowData={{ rowIndex: index, selectedFilters, expandAll }}
                    index={index}
                  />
                ))}
              </Table>
            ) : (
              <NNStateEmptyState />
            )}
          </DataView>
        </StatusBox>
      </ListPageBody>
      <InterfaceDrawer onClose={onClose} selectedInterface={selectedInterface} />
    </>
  );
};

export default StatesList;
