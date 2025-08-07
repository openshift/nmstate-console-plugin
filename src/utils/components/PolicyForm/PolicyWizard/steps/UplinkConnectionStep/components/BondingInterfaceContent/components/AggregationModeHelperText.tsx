import React, { FC } from 'react';

import { InfoCircleIcon } from '@patternfly/react-icons';
import { aggregationModes } from '@utils/components/PolicyForm/PolicyWizard/steps/UplinkConnectionStep/components/BondingInterfaceContent/utils/utils';

type AggregationModeHelperTextProps = {
  selectedAggregationMode: string;
};

const AggregationModeHelperText: FC<AggregationModeHelperTextProps> = ({
  selectedAggregationMode,
}) => {
  if (!selectedAggregationMode) return null;

  const { helperText } = aggregationModes[selectedAggregationMode];

  return (
    <div className="pf-v6-u-mt-sm">
      <InfoCircleIcon
        className="pf-v6-u-mr-sm"
        color="var(--pf-t--global--icon--color--status--info--default)"
      />
      <span className="pf-v6-u-mr-sm">{helperText}</span>
    </div>
  );
};

export default AggregationModeHelperText;
