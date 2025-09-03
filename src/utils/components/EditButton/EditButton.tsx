import React, { FC, PropsWithChildren, SyntheticEvent } from 'react';

import { Button, ButtonVariant } from '@patternfly/react-core';
import { PencilAltIcon } from '@patternfly/react-icons';

import { IconPosition } from './utils/types';

type EditButtonProps = PropsWithChildren<{
  iconPosition?: IconPosition;
  isEditable: boolean;
  onEditClick?: () => void;
  testId: string;
}>;

const EditButton: FC<EditButtonProps> = ({
  children,
  onEditClick,
  isEditable,
  testId,
  iconPosition = 'start',
}) => (
  <Button
    onClick={(e: SyntheticEvent<HTMLButtonElement>) => {
      e.stopPropagation();
      onEditClick?.();
    }}
    data-test-id={testId}
    isDisabled={!isEditable}
    isInline
    variant={ButtonVariant.link}
    icon={<PencilAltIcon />}
    iconPosition={iconPosition}
  >
    {children}
  </Button>
);

export default EditButton;
