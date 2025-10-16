import React, { FC } from 'react';
import StateDetailsPage from 'src/views/states/details/StateDetailsPage';

import { V1beta1NodeNetworkState } from '@kubevirt-ui/kubevirt-api/nmstate';
import { isEmpty } from '@utils/helpers';
import useQueryParams from '@utils/hooks/useQueryParams';

import useSelectedResources from './hooks/useSelectedResources';
import InterfaceDrawer from './InterfaceDrawer/InterfaceDrawer';
import { CREATE_POLICY_QUERY_PARAM, SELECTED_ID_QUERY_PARAM } from './constants';
import CreatePolicyDrawer from './CreatePolicyDrawer';
import PolicyDrawer from './PolicyDrawer';

type DrawerProps = {
  states: V1beta1NodeNetworkState[];
  onClose: () => void;
};

const Drawer: FC<DrawerProps> = ({ states, onClose }) => {
  const params = useQueryParams();

  const selectedId = params?.[SELECTED_ID_QUERY_PARAM] || '';

  const createPolicy = !isEmpty(params?.[CREATE_POLICY_QUERY_PARAM]);

  const { selectedInterface, selectedPolicy, selectedState } = useSelectedResources(
    selectedId,
    states,
  );

  if (createPolicy) return <CreatePolicyDrawer onClose={onClose} />;

  if (selectedInterface && !selectedPolicy)
    return <InterfaceDrawer selectedInterface={selectedInterface} />;

  if (selectedState && !selectedInterface) return <StateDetailsPage nns={selectedState} />;

  if (selectedInterface && selectedPolicy)
    return <PolicyDrawer selectedPolicy={selectedPolicy} selectedInterface={selectedInterface} />;

  return null;
};

export default Drawer;
