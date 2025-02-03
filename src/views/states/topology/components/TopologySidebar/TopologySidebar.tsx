import React, { Dispatch, FC, SetStateAction, useMemo } from 'react';

import { TopologySideBar } from '@patternfly/react-topology';
import { V1beta1NodeNetworkState } from '@types';

import StateDetailsPage from '../../../details/StateDetailsPage';
import InterfaceDrawer from '../../../list/components/InterfaceDrawer/InterfaceDrawer';

import './TopologySidebar.scss';

type TopologySidebarProps = {
  states: V1beta1NodeNetworkState[];
  selectedIds: string[];
  setSelectedIds: Dispatch<SetStateAction<string[]>>;
};
const TopologySidebar: FC<TopologySidebarProps> = ({ states, selectedIds, setSelectedIds }) => {
  const { selectedState, selectedInterface } = useMemo(() => {
    if (selectedIds.length === 0) return { selectedState: null, selectedInterface: null };

    const [selectedNNSName, selectedInterfaceName] = selectedIds[0].split('~');
    const selectedState = states?.find((state) => state.metadata.name === selectedNNSName);
    const selectedInterface = selectedState?.status?.currentState?.interfaces?.find(
      (iface) => iface.name === selectedInterfaceName,
    );

    return { selectedState, selectedInterface };
  }, [selectedIds, states]);

  return (
    <TopologySideBar show={selectedIds.length > 0} onClose={() => setSelectedIds([])}>
      <div className="topology-sidebar__content">
        {!selectedInterface ? (
          <StateDetailsPage nns={selectedState} />
        ) : (
          <>
            <InterfaceDrawer
              selectedInterface={selectedInterface}
              onClose={() => setSelectedIds([])}
            />
          </>
        )}
      </div>
    </TopologySideBar>
  );
};

export default TopologySidebar;
