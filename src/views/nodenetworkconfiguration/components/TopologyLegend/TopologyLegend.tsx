import React, { FC } from 'react';

import { DescriptionList, Flex, FlexItem, Title } from '@patternfly/react-core';
import { EthernetIcon, LinkIcon, NetworkIcon } from '@patternfly/react-icons';
import { useNMStateTranslation } from '@utils/hooks/useNMStateTranslation';

import BridgeIcon from '../BridgeIcon';

import TopologyLegendItem from './TopologyLegendItem';

import './TopologyLegend.scss';

const TopologyLegend: FC = () => {
  const { t } = useNMStateTranslation();

  return (
    <>
      <Title headingLevel="h3" className="pf-v5-u-screen-reader" data-testid="legend-title">
        {t('Legend')}
      </Title>
      <Flex direction={{ default: 'column' }}>
        <FlexItem>
          <Title headingLevel="h4" className="pf-v5-u-pb-sm" data-testid="node-network-types-title">
            {t('Network types')}
          </Title>
          <DescriptionList
            horizontalTermWidthModifier={{ default: '20px' }}
            isAutoColumnWidths
            isCompact
            isHorizontal
            termWidth="20px"
            className="topology-dl"
          >
            <TopologyLegendItem description={t('Ethernet')} icon={<EthernetIcon />} />
            <TopologyLegendItem icon={<BridgeIcon />} description={t('Bridge')} />
            <TopologyLegendItem icon={<LinkIcon />} description={t('Bond')} />
            <TopologyLegendItem icon={<NetworkIcon />} description={t('Other network type')} />
          </DescriptionList>
        </FlexItem>
      </Flex>
    </>
  );
};

export default TopologyLegend;
