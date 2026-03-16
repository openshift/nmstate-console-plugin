import React, { FC } from 'react';
import { useNavigate } from 'react-router-dom-v5-compat';

import PaneHeading from '@utils/components/PaneHeading/PaneHeading';
import { useNMStateTranslation } from '@utils/hooks/useNMStateTranslation';
import { Button, Title } from '@patternfly/react-core';

import { NODE_NETWORK_CONFIGURATION_WIZARD_PATH } from '../utils/constants';

type PhysicalNetworksPageHeaderProps = {
  showCreateButton: boolean;
};

const PhysicalNetworksPageHeader: FC<PhysicalNetworksPageHeaderProps> = ({ showCreateButton }) => {
  const { t } = useNMStateTranslation();
  const navigate = useNavigate();

  return (
    <PaneHeading>
      <Title className="pf-v6-u-mb-xl" data-test-id="resource-title" headingLevel="h1">
        {t('Physical networks')}
      </Title>
      {showCreateButton && (
        <Button
          onClick={() => navigate(NODE_NETWORK_CONFIGURATION_WIZARD_PATH)}
          variant="primary"
        >
          {t('Create network')}
        </Button>
      )}
    </PaneHeading>
  );
};

export default PhysicalNetworksPageHeader;
