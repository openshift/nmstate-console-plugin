import React, { FC } from 'react';
import { useNavigate } from 'react-router';

import { Button, Flex, FlexItem, Title } from '@patternfly/react-core';
import { useNMStateTranslation } from '@utils/hooks/useNMStateTranslation';

import './NodeTopologyToolbar.scss';

const NodeTopologyToolbar: FC = () => {
  const { t } = useNMStateTranslation();
  const navigate = useNavigate();

  return (
    <Flex
      className="pf-v6-u-w-100 pf-v6-u-mt-md pf-v6-u-mx-md"
      flexWrap={{ default: 'wrap' }}
      gap={{ default: 'gapMd' }}
      alignItems={{ default: 'alignItemsCenter' }}
      justifyContent={{ default: 'justifyContentSpaceBetween' }}
    >
      <FlexItem flex={{ default: 'flex_1' }}>
        <Title headingLevel="h2">{t('Network')}</Title>
      </FlexItem>
      <FlexItem>
        <Button variant="link" onClick={() => navigate('/node-network-configuration')}>
          {t('See all nodes in this cluster')}
        </Button>
      </FlexItem>
    </Flex>
  );
};

export default NodeTopologyToolbar;
