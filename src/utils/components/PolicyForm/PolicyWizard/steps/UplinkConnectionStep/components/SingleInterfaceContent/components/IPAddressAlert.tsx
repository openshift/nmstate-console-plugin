import React, { FC } from 'react';

import { Split, SplitItem } from '@patternfly/react-core';
import { WarningTriangleIcon } from '@patternfly/react-icons';
import { useNMStateTranslation } from '@utils/hooks/useNMStateTranslation';

const IPAddressAlert: FC = () => {
  const { t } = useNMStateTranslation();

  return (
    <Split className="pf-v6-u-mt-sm pf-v6-u-font-size-sm">
      <SplitItem className="pf-v6-u-pr-sm">
        <WarningTriangleIcon color="var(--pf-t--global--icon--color--status--warning--default)" />
      </SplitItem>
      <SplitItem>
        <div className="pf-v6-u-font-weight-bold">
          {t(
            'The selected secondary interface is configured with an IP address on some of the nodes.',
          )}
        </div>
        <div>
          {t('Using it as an uplink will remove its IP address and may disrupt network services.')}
        </div>
      </SplitItem>
    </Split>
  );
};

export default IPAddressAlert;
