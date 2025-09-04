import React, { FC } from 'react';
import { Trans } from 'react-i18next';
import { useNMStateTranslation } from 'src/utils/hooks/useNMStateTranslation';

import EmptyPolicyStateImage from '@images/empty-state-illustration.svg';
import {
  Button,
  ButtonVariant,
  EmptyState,
  EmptyStateActions,
  EmptyStateBody,
  EmptyStateFooter,
  EmptyStateVariant,
} from '@patternfly/react-core';
import ExternalLinkSquareAltIcon from '@patternfly/react-icons/dist/esm/icons/external-link-square-alt-icon';

import { NODE_NETWORK_POLICY_DOCUMENTATION_URL } from './constants';

import './policy-list-empty-state.scss';
import CreatePolicyButtons from '../CreatePolicyButtons';

const PolicyListEmptyState: FC = () => {
  const { t } = useNMStateTranslation();

  return (
    <EmptyState
      titleText={t('No NodeNetworkConfigurationPolicy defined yet')}
      headingLevel="h4"
      icon={() => <img src={EmptyPolicyStateImage} className="policy-empty-state-icon" />}
      variant={EmptyStateVariant.lg}
    >
      <EmptyStateBody>
        <Trans t={t} ns="plugin__nmstate-console-plugin">
          Click <strong>Create NodeNetworkConfigurationPolicy</strong> to create your first policy
        </Trans>
      </EmptyStateBody>
      <EmptyStateFooter>
        <EmptyStateActions>
          <CreatePolicyButtons>{t('Create NodeNetworkConfigurationPolicy')}</CreatePolicyButtons>
        </EmptyStateActions>
        <EmptyStateActions>
          <Button
            variant={ButtonVariant.link}
            icon={<ExternalLinkSquareAltIcon />}
            iconPosition="right"
          >
            <a
              href={NODE_NETWORK_POLICY_DOCUMENTATION_URL}
              target="_blank"
              rel="noopener noreferrer"
            >
              {t('View documentation')}
            </a>
          </Button>
        </EmptyStateActions>
      </EmptyStateFooter>
    </EmptyState>
  );
};

export default PolicyListEmptyState;
