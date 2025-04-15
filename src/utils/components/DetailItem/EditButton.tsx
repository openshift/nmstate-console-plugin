import React, { FC, PropsWithChildren, SyntheticEvent } from 'react';

import { Button, ButtonVariant } from '@patternfly/react-core';
import { PencilAltIcon } from '@patternfly/react-icons';

type EditButtonProps = PropsWithChildren<{
  isEditable: boolean;
  onEditClick?: () => void;
  testId: string;
}>;

const EditButton: FC<EditButtonProps> = ({ children, onEditClick, isEditable, testId }) => (
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
  >
    {children}
  </Button>
);

export default EditButton;
