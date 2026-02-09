import React, { FC } from 'react';
import { Link } from 'react-router-dom-v5-compat';

import DetailItem from '@utils/components/DetailItem/DetailItem';
import { getName } from '@utils/components/resources/selectors';
import { NO_DATA_DASH } from '@utils/constants';
import { getResourceUrl } from '@utils/helpers';
import { useNMStateTranslation } from '@utils/hooks/useNMStateTranslation';

import NodeNetworkConfigurationPolicyModel from '../../../../../console-models/NodeNetworkConfigurationPolicyModel';
import { DescriptionList } from '@patternfly/react-core';

import { ConfigurationDetails } from '../../../utils/types';

type DetailsTabProps = {
  selectedConfiguration: ConfigurationDetails;
};

const DetailsTab: FC<DetailsTabProps> = ({ selectedConfiguration }) => {
  const { t } = useNMStateTranslation();

  const nncpURL = selectedConfiguration?.nncp
    ? getResourceUrl({
        model: NodeNetworkConfigurationPolicyModel,
        resource: selectedConfiguration?.nncp,
      })
    : undefined;

  return (
    <DescriptionList className="pf-v6-u-my-xl">
      <DetailItem
        description={selectedConfiguration?.physicalNetworkName}
        header={t('Network name')}
      />
      <DetailItem
        description={
          nncpURL ? <Link to={nncpURL}>{getName(selectedConfiguration?.nncp)}</Link> : NO_DATA_DASH
        }
        header={t('Configuration name')}
      />
      <DetailItem
        description={selectedConfiguration?.description ?? NO_DATA_DASH}
        header={t('Description')}
      />
      <DetailItem
        description={selectedConfiguration?.uplink ?? NO_DATA_DASH}
        header={t('Uplink connection')}
      />
      <DetailItem
        description={selectedConfiguration?.aggregationMode ?? NO_DATA_DASH}
        header={t('Aggregation mode')}
      />
      <DetailItem
        description={selectedConfiguration?.mtu ?? NO_DATA_DASH}
        header={t('MTU')}
      />
    </DescriptionList>
  );
};

export default DetailsTab;
