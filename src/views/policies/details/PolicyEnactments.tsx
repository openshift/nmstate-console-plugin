import React, { FC } from 'react';

import { NodeNetworkConfigurationEnactmentModelGroupVersionKind } from '@models';
import { useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';
import { Stack, StackItem } from '@patternfly/react-core';
import { V1beta1NodeNetworkConfigurationEnactment, V1NodeNetworkConfigurationPolicy } from '@types';
import { isEmpty } from '@utils/helpers';
import { useNMStateTranslation } from '@utils/hooks/useNMStateTranslation';
import { IconsByStatus } from '@utils/resources/enactments/icons';
import { categorizeEnactments } from '@utils/resources/enactments/utils';
import { getPolicyEnactments } from '@utils/resources/policies/utils';

import { EnactmentStatuses } from '../constants';

type PolicyEnactmentsProps = {
  policy: V1NodeNetworkConfigurationPolicy;
};

const PolicyEnactments: FC<PolicyEnactmentsProps> = ({ policy }) => {
  const { t } = useNMStateTranslation();

  const [enactments] = useK8sWatchResource<V1beta1NodeNetworkConfigurationEnactment[]>({
    groupVersionKind: NodeNetworkConfigurationEnactmentModelGroupVersionKind,
    isList: true,
  });

  const selectedPolicyEnactments = getPolicyEnactments(policy, enactments);

  const {
    available: availableEnactments,
    pending: pendingEnactments,
    progressing: progressingEnactments,
    failing: failingEnactments,
    aborted: abortedEnactments,
  } = categorizeEnactments(selectedPolicyEnactments);

  return (
    <Stack>
      {!isEmpty(availableEnactments) && (
        <StackItem>
          {IconsByStatus[EnactmentStatuses.Available]}{' '}
          {t('{{count}} available enactments', { count: availableEnactments.length })}
        </StackItem>
      )}

      {!isEmpty(pendingEnactments) && (
        <StackItem>
          {IconsByStatus[EnactmentStatuses.Pending]}{' '}
          {t('{{count}} pending enactments', { count: pendingEnactments.length })}
        </StackItem>
      )}

      {!isEmpty(progressingEnactments) && (
        <StackItem>
          {IconsByStatus[EnactmentStatuses.Progressing]}{' '}
          {t('{{count}} progressing enactments', { count: progressingEnactments.length })}
        </StackItem>
      )}

      {!isEmpty(failingEnactments) && (
        <StackItem>
          {IconsByStatus[EnactmentStatuses.Failing]}{' '}
          {t('{{count}} failing enactments', { count: failingEnactments.length })}
        </StackItem>
      )}

      {!isEmpty(abortedEnactments) && (
        <StackItem>
          {IconsByStatus[EnactmentStatuses.Aborted]}{' '}
          {t('{{count}} aborted enactments', { count: abortedEnactments.length })}
        </StackItem>
      )}
    </Stack>
  );
};

export default PolicyEnactments;
