import React from 'react';

import { RedExclamationCircleIcon } from '@openshift-console/dynamic-plugin-sdk';
import { Icon } from '@patternfly/react-core';
import { CheckIcon, CloseIcon, HourglassHalfIcon, InProgressIcon } from '@patternfly/react-icons';

import { EnactmentStatuses } from '../../../views/policies/constants';

export const IconsByStatus = {
  [EnactmentStatuses.Failing]: <RedExclamationCircleIcon />,
  [EnactmentStatuses.Aborted]: (
    <Icon status="danger">
      <CloseIcon />
    </Icon>
  ),
  [EnactmentStatuses.Available]: (
    <Icon status="success">
      <CheckIcon />
    </Icon>
  ),
  [EnactmentStatuses.Progressing]: <InProgressIcon />,
  [EnactmentStatuses.Pending]: <HourglassHalfIcon />,
};
