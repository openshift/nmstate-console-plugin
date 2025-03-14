import React, { FC } from 'react';
import { Trans } from 'react-i18next';
import { useHistory } from 'react-router-dom';
import NodeNetworkConfigurationPolicyModel from 'src/console-models/NodeNetworkConfigurationPolicyModel';
import { getResourceUrl } from 'src/utils/helpers';
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

const PolicyListEmptyState: FC = () => {
  const { t } = useNMStateTranslation();
  const history = useHistory();
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
          <Button
            variant={ButtonVariant.primary}
            onClick={() =>
              history.push(
                `${getResourceUrl({
                  model: NodeNetworkConfigurationPolicyModel,
                })}~new/form`,
              )
            }
          >
            {t('Create NodeNetworkConfigurationPolicy')}
          </Button>
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
