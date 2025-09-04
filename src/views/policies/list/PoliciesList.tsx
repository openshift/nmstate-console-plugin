import React, { FC, useCallback, useState } from 'react';
import { useHistory } from 'react-router-dom';
import {
  NodeNetworkConfigurationEnactmentModelGroupVersionKind,
  NodeNetworkConfigurationPolicyModelGroupVersionKind,
  NodeNetworkConfigurationPolicyModelRef,
} from 'src/console-models';
import NodeNetworkConfigurationPolicyModel from 'src/console-models/NodeNetworkConfigurationPolicyModel';
import { useNMStateTranslation } from 'src/utils/hooks/useNMStateTranslation';

import {
  ListPageBody,
  ListPageCreateDropdown,
  ListPageFilter,
  ListPageHeader,
  useK8sWatchResource,
  useListPageFilter,
  VirtualizedTable,
} from '@openshift-console/dynamic-plugin-sdk';
import { V1beta1NodeNetworkConfigurationEnactment, V1NodeNetworkConfigurationPolicy } from '@types';
import { getResourceUrl } from '@utils/helpers';
import { getPolicyEnactments } from '@utils/resources/policies/utils';

import { EnactmentStatuses } from '../constants';

import PolicyEnactmentsDrawer from './components/PolicyEnactmentsDrawer/PolicyEnactmentsDrawer';
import PolicyListEmptyState from './components/PolicyListEmptyState/PolicyListEmptyState';
import PolicyRow from './components/PolicyRow';
import usePolicyColumns from './hooks/usePolicyColumns';
import usePolicyFilters from './hooks/usePolicyFilters';
import CreatePolicyButtons from './components/CreatePolicyButtons';

const PoliciesList: FC = () => {
  const { t } = useNMStateTranslation();
  const [selectedPolicy, setSelectedPolicy] = useState<V1NodeNetworkConfigurationPolicy>();
  const [selectedState, setSelectedState] = useState<EnactmentStatuses>();

  const [policies, policiesLoaded, policiesLoadError] = useK8sWatchResource<
    V1NodeNetworkConfigurationPolicy[]
  >({
    groupVersionKind: NodeNetworkConfigurationPolicyModelGroupVersionKind,
    isList: true,
    namespaced: false,
  });

  const [enactments, enactmentsLoaded, enactmentsError] = useK8sWatchResource<
    V1beta1NodeNetworkConfigurationEnactment[]
  >({
    groupVersionKind: NodeNetworkConfigurationEnactmentModelGroupVersionKind,
    isList: true,
  });

  const [columns, activeColumns] = usePolicyColumns();
  const filters = usePolicyFilters(enactments);
  const [data, filteredData, onFilterChange] = useListPageFilter(policies, filters);

  const selectedPolicyEnactments = getPolicyEnactments(selectedPolicy, enactments);
  const onSelectPolicy = useCallback(
    (policy: V1NodeNetworkConfigurationPolicy, state: EnactmentStatuses) => {
      setSelectedPolicy(policy);
      setSelectedState(state);
    },
    [],
  );

  return (
    <>
      <ListPageHeader title={t(NodeNetworkConfigurationPolicyModel.label)}>
        <CreatePolicyButtons>{t('Create')}</CreatePolicyButtons>
      </ListPageHeader>
      <ListPageBody>
        <ListPageFilter
          data={data}
          loaded={policiesLoaded}
          rowFilters={filters}
          onFilterChange={onFilterChange}
          columnLayout={{
            columns: columns?.map(({ id, title, additional }) => ({
              id,
              title,
              additional,
            })),
            id: NodeNetworkConfigurationPolicyModelRef,
            selectedColumns: new Set(activeColumns?.map((col) => col?.id)),
            type: t('NodeNetworkConfigurationPolicy'),
          }}
        />

        <VirtualizedTable<V1NodeNetworkConfigurationPolicy>
          data={filteredData}
          unfilteredData={data}
          loaded={policiesLoaded && enactmentsLoaded}
          columns={activeColumns}
          loadError={policiesLoadError && enactmentsError}
          Row={PolicyRow}
          rowData={{ selectPolicy: onSelectPolicy, enactments }}
          NoDataEmptyMsg={() => <PolicyListEmptyState />}
        />

        <PolicyEnactmentsDrawer
          selectedPolicy={selectedPolicy}
          selectedState={selectedState}
          onClose={() => {
            setSelectedPolicy(undefined);
            setSelectedState(undefined);
          }}
          enactments={selectedPolicyEnactments}
        />
      </ListPageBody>
    </>
  );
};

export default PoliciesList;
