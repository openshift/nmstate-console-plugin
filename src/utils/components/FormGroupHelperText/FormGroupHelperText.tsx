import React, { FC } from 'react';

import { RedExclamationCircleIcon as ErrorIcon } from '@openshift-console/dynamic-plugin-sdk';
import {
  FormHelperText,
  HelperText,
  HelperTextItem,
  ValidatedOptions,
} from '@patternfly/react-core';

type FormGroupHelperTextProps = {
  validated?: ValidatedOptions;
  showOnError?: boolean;
};

const FormGroupHelperText: FC<FormGroupHelperTextProps> = ({
  children,
  validated = ValidatedOptions.default,
  showOnError,
}) => {
  const isError = validated === ValidatedOptions.error;

  if (showOnError && !isError) return null;

  return (
    <FormHelperText>
      <HelperText>
        <HelperTextItem icon={isError && <ErrorIcon />} variant={validated}>
          {isError && children}
        </HelperTextItem>
      </HelperText>
    </FormHelperText>
  );
};

export default FormGroupHelperText;
