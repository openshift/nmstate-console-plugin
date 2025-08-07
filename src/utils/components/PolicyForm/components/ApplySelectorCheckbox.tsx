import React, { FC } from 'react';
import { useNMStateTranslation } from 'src/utils/hooks/useNMStateTranslation';

import { Checkbox, CheckboxProps } from '@patternfly/react-core';
import TextWithHelpIcon from '@utils/components/HelpTextIcon/TextWithHelpIcon';

type ApplySelectorCheckboxProps = {
  isChecked: boolean;
  onChange: CheckboxProps['onChange'];
};

const ApplySelectorCheckbox: FC<ApplySelectorCheckboxProps> = ({ isChecked, onChange }) => {
  const { t } = useNMStateTranslation();

  return (
    <Checkbox
      id="apply-nncp-selector"
      isChecked={isChecked}
      onChange={onChange}
      label={
        <TextWithHelpIcon
          helpBodyContent={t(
            'Deselect this box to apply the policy to all matching nodes on the cluster',
          )}
          text={t('Apply this only to specific subsets of nodes using the node selector')}
        />
      }
    />
  );
};

export default ApplySelectorCheckbox;
