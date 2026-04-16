import React, { FC } from 'react';

import { V1NodeNetworkConfigurationPolicy } from '@kubevirt-ui/kubevirt-api/nmstate';
import DetailItem from '@utils/components/DetailItem/DetailItem';
import useInheritedMTU from '@utils/components/PolicyForm/PolicyWizard/utils/hooks/useInheritedMTU/useInheritedMTU';
import { ConnectionOption } from '@utils/components/PolicyForm/PolicyWizard/utils/types';
import { getUplinkConnectionOption } from '@utils/components/PolicyForm/PolicyWizard/utils/utils';
import { NO_DATA_DASH } from '@utils/constants';
import { useNMStateTranslation } from '@utils/hooks/useNMStateTranslation';
import { getMTU } from '@utils/resources/policies/selectors';

type MTUDetailItemProps = {
  policy: V1NodeNetworkConfigurationPolicy;
};

const MTUDetailItem: FC<MTUDetailItemProps> = ({ policy }) => {
  const { t } = useNMStateTranslation();
  const inheritedMTU = useInheritedMTU(policy);
  const explicitMTU = getMTU(policy);
  const isBrex = getUplinkConnectionOption(policy) === ConnectionOption.BREX;

  const hint = inheritedMTU ? (
    <span className="pf-v6-u-text-color-subtle pf-v6-u-font-size-sm pf-v6-u-ml-sm">
      {isBrex
        ? t('({{inheritedMTU}} from existing bridge)', { inheritedMTU })
        : t('({{inheritedMTU}} from uplink)', { inheritedMTU })}
    </span>
  ) : null;

  return (
    <DetailItem
      header={t('MTU')}
      description={
        <>
          {explicitMTU || NO_DATA_DASH}
          {!explicitMTU && hint}
        </>
      }
    />
  );
};

export default MTUDetailItem;
