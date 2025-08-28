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
};

const FormGroupHelperText: FC<FormGroupHelperTextProps> = ({
  children,
  validated = ValidatedOptions.default,
}) => (
  <FormHelperText>
    <HelperText>
      <HelperTextItem
        icon={validated === ValidatedOptions.error && <ErrorIcon />}
        variant={validated}
      >
        {children}
      </HelperTextItem>
    </HelperText>
  </FormHelperText>
);

export default FormGroupHelperText;
