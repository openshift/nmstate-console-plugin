import React, { FC, useState } from 'react';

import { PageSection } from '@patternfly/react-core';

import Loading from '@utils/components/Loading/Loading';
import { isEmpty } from '@utils/helpers';

import ConfigurationDrawer from './components/ConfigurationDrawer/ConfigurationDrawer';
import PhysicalNetworksEmptyState from './components/PhysicalNetworksEmptyState';
import PhysicalNetworksPageHeader from './components/PhysicalNetworksPageHeader';
import PhysicalNetworksTable from './components/PhysicalNetworksTable/PhysicalNetworksTable';
import usePhysicalNetworks from './hooks/usePhysicalNetworks/usePhysicalNetworks';
import { ConfigurationDetails } from './utils/types';

const PhysicalNetworksPage: FC = () => {
  const { physicalNetworks, physicalNetworksLoaded } = usePhysicalNetworks();
  const [selectedConfiguration, setSelectedConfiguration] =
    useState<ConfigurationDetails>(undefined);

  return (
    <PageSection>
      <PhysicalNetworksPageHeader showCreateButton={!isEmpty(physicalNetworks)} />
      {!physicalNetworksLoaded && <Loading />}
      {physicalNetworksLoaded && isEmpty(physicalNetworks) && <PhysicalNetworksEmptyState />}
      {physicalNetworksLoaded && !isEmpty(physicalNetworks) && (
        <PhysicalNetworksTable
          physicalNetworks={physicalNetworks}
          setSelectedConfiguration={setSelectedConfiguration}
        />
      )}
      <ConfigurationDrawer
        isOpen={!!selectedConfiguration}
        onClose={() => setSelectedConfiguration(undefined)}
        selectedConfiguration={selectedConfiguration}
      />
    </PageSection>
  );
};

export default PhysicalNetworksPage;
