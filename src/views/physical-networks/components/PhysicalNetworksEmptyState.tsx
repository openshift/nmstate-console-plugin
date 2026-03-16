import React, { FC } from 'react';
import { useNavigate } from 'react-router-dom-v5-compat';

import { useNMStateTranslation } from '@utils/hooks/useNMStateTranslation';
import {
  Button,
  EmptyState,
  EmptyStateActions,
  EmptyStateBody,
  EmptyStateFooter,
  EmptyStateVariant,
} from '@patternfly/react-core';
import { PlusCircleIcon } from '@patternfly/react-icons';

import { NODE_NETWORK_CONFIGURATION_WIZARD_PATH } from '../utils/constants';

const PhysicalNetworksEmptyState: FC = () => {
  const { t } = useNMStateTranslation();
  const navigate = useNavigate();

  return (
    <EmptyState
      headingLevel="h4"
      icon={PlusCircleIcon}
      titleText={t('No physical networks defined yet')}
      variant={EmptyStateVariant.lg}
    >
      <EmptyStateBody>
        {t(
          'A physical network establishes a specific network configuration on cluster nodes. To get started, create a physical network.',
        )}
      </EmptyStateBody>
      <EmptyStateFooter>
        <EmptyStateActions>
          <Button onClick={() => navigate(NODE_NETWORK_CONFIGURATION_WIZARD_PATH)}>
            {t('Create network')}
          </Button>
        </EmptyStateActions>
      </EmptyStateFooter>
    </EmptyState>
  );
};

export default PhysicalNetworksEmptyState;
