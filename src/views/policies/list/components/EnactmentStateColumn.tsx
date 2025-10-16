import React, { FC } from 'react';
import { useNMStateTranslation } from 'src/utils/hooks/useNMStateTranslation';
import { EnactmentStatuses } from 'src/views/policies/constants';

import { V1beta1NodeNetworkConfigurationEnactment } from '@kubevirt-ui/kubevirt-api/nmstate';
import { Button, ButtonVariant, Stack, StackItem } from '@patternfly/react-core';
import { IconsByStatus } from '@utils/resources/enactments/icons';
import { categorizeEnactments } from '@utils/resources/enactments/utils';

type NNCPStateColumnProps = {
  enactments: V1beta1NodeNetworkConfigurationEnactment[];
  onStateClick: (state: EnactmentStatuses) => void;
};

const NNCPStateColumn: FC<NNCPStateColumnProps> = ({ enactments, onStateClick }) => {
  const { t } = useNMStateTranslation();

  const { available, pending, failing, progressing, aborted } = categorizeEnactments(enactments);

  const states = [
    {
      number: failing.length,
      label: EnactmentStatuses.Failing,
    },
    {
      number: aborted.length,
      label: EnactmentStatuses.Aborted,
    },
    {
      number: available.length,
      label: EnactmentStatuses.Available,
    },
    {
      number: progressing.length,
      label: EnactmentStatuses.Progressing,
    },
    {
      number: pending.length,
      label: EnactmentStatuses.Pending,
    },
  ].filter((state) => state.number > 0);

  return (
    <Stack hasGutter>
      {states.length === 0 && <StackItem>-</StackItem>}
      {states.map((state) => (
        <StackItem key={state.label}>
          <Button
            variant={ButtonVariant.link}
            isInline
            onClick={() => onStateClick(state.label)}
            icon={IconsByStatus[state.label]}
          >
            {state.number} {t(state.label)}
          </Button>
        </StackItem>
      ))}
    </Stack>
  );
};

export default NNCPStateColumn;
