import React, { FC } from 'react';

import { EmptyState, EmptyStateVariant } from '@patternfly/react-core';
import { useNMStateTranslation } from '@utils/hooks/useNMStateTranslation';

const NNStateEmptyState: FC = () => {
  const { t } = useNMStateTranslation();
  return (
    <EmptyState
      headingLevel="h5"
      titleText={t('No NodeNetworkStates found')}
      variant={EmptyStateVariant.full}
    />
  );
};

export default NNStateEmptyState;
