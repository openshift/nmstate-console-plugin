import React, { Dispatch, FC, SetStateAction, useState } from 'react';
import { useHistory } from 'react-router-dom';

import { Button } from '@patternfly/react-core';
import { ActionsColumn, ExpandableRowContent, Tbody, Td, Tr } from '@patternfly/react-table';

import { NO_DATA_DASH } from '@utils/constants';
import { isEmpty } from '@utils/helpers';
import { useNMStateTranslation } from '@utils/hooks/useNMStateTranslation';

import { ConfigurationDetails, PhysicalNetwork } from '../../../../utils/types';
import NodesModal from '../../../NodesModal/NodesModal';
import ConfigurationsTable from '../ConfigurationsTable/ConfigurationsTable';

import { getRowActions } from './utils/utils';

type PhysicalNetworksRowProps = {
  expandedNetworks: string[];
  index: number;
  network: PhysicalNetwork;
  setNetworkExpanded: (network: PhysicalNetwork, isExpanding: boolean) => void;
  setSelectedConfiguration: Dispatch<SetStateAction<ConfigurationDetails>>;
};

const PhysicalNetworkRow: FC<PhysicalNetworksRowProps> = ({
  expandedNetworks,
  index,
  network,
  setNetworkExpanded,
  setSelectedConfiguration,
}) => {
  const { t } = useNMStateTranslation();
  const [isNodesModalOpen, setIsNodesModalOpen] = useState(false);
  const history = useHistory();
  const isNetworkExpanded = (physicalNetwork: PhysicalNetwork) =>
    expandedNetworks.includes(physicalNetwork.name);

  return (
    <Tbody isExpanded={isNetworkExpanded(network)} key={network.name}>
      <Tr>
        <Td
          expand={
            !isEmpty(network.nncps)
              ? {
                  expandId: 'composable-expandable-example',
                  isExpanded: isNetworkExpanded(network),
                  onToggle: () => setNetworkExpanded(network, !isNetworkExpanded(network)),
                  rowIndex: index,
                }
              : undefined
          }
        />
        <Td id="name" key="name">
          {network?.name ?? NO_DATA_DASH}
        </Td>
        <Td id="nodes" key="nodes">
          <Button onClick={() => setIsNodesModalOpen(true)} variant="link">
            {network?.nodeCount ?? NO_DATA_DASH}
          </Button>
        </Td>
        <Td id="actionColumn" isActionCell key="actionColumn">
          <ActionsColumn items={getRowActions(t, history, network.name)} />
        </Td>
      </Tr>
      {!isEmpty(network.nncps) ? (
        <Tr isExpanded={isNetworkExpanded(network)}>
          <Td colSpan={12} dataLabel="NNCP row">
            <ExpandableRowContent>
              <ConfigurationsTable
                nncpDetails={network.nncpDetails}
                setSelectedConfiguration={setSelectedConfiguration}
              />
            </ExpandableRowContent>
          </Td>
        </Tr>
      ) : null}
      <NodesModal
        isOpen={isNodesModalOpen}
        nodes={network.physicalNetworkNodes}
        onClose={() => setIsNodesModalOpen(false)}
      />
    </Tbody>
  );
};

export default PhysicalNetworkRow;
