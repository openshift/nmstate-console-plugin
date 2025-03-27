import React, { Dispatch, FC, SetStateAction } from 'react';

import { TopologySideBar } from '@patternfly/react-topology';
import { V1beta1NodeNetworkState } from '@types';

import StateDetailsPage from '../../../states/details/StateDetailsPage';

import useSelectedResources from './hooks/useSelectedResources';
import InterfaceDrawer from './InterfaceDrawer/InterfaceDrawer';
import PolicyDrawer from './PolicyDrawer';

import './TopologySidebar.scss';

type TopologySidebarProps = {
  states: V1beta1NodeNetworkState[];
  selectedIds: string[];
  setSelectedIds: Dispatch<SetStateAction<string[]>>;
};
const TopologySidebar: FC<TopologySidebarProps> = ({ states, selectedIds, setSelectedIds }) => {
  const { selectedInterface, selectedPolicy, selectedState } = useSelectedResources(
    selectedIds,
    states,
  );
  return (
    <TopologySideBar show={selectedIds.length > 0} onClose={() => setSelectedIds([])}>
      <div className="topology-sidebar__content">
        {selectedInterface && !selectedPolicy && (
          <InterfaceDrawer selectedInterface={selectedInterface} />
        )}
        {selectedState && !selectedInterface && <StateDetailsPage nns={selectedState} />}

        {selectedInterface && selectedPolicy && (
          <PolicyDrawer selectedPolicy={selectedPolicy} selectedInterface={selectedInterface} />
        )}
      </div>
    </TopologySideBar>
  );
};

export default TopologySidebar;
