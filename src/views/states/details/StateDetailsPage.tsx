import React, { FC } from 'react';

import { NodeNetworkStateModel, NodeNetworkStateModelGroupVersionKind } from '@models';
import {
  ResourceIcon,
  Timestamp,
  useAnnotationsModal,
  useLabelsModal,
} from '@openshift-console/dynamic-plugin-sdk';
import { DescriptionList, Divider, PageSection, Title } from '@patternfly/react-core';
import { V1beta1NodeNetworkState } from '@types';
import DetailItem from '@utils/components/DetailItem/DetailItem';
import OwnerDetailsItem from '@utils/components/DetailItem/OwnerDetailItem';
import MetadataLabels from '@utils/components/MetadataLabels/MetadataLabels';
import { useNMStateTranslation } from '@utils/hooks/useNMStateTranslation';

type StateDetailsPageProps = {
  nns: V1beta1NodeNetworkState;
};

const StateDetailsPage: FC<StateDetailsPageProps> = ({ nns }) => {
  const { t } = useNMStateTranslation();
  const launchLabelsModal = useLabelsModal(nns);
  const launchAnnotationsModal = useAnnotationsModal(nns);

  if (!nns) return null;

  const annotationsCount = Object.keys(nns?.metadata?.annotations || {}).length;
  const annotationsText = t('{{annotationsCount}} Annotations', {
    annotationsCount,
  });

  return (
    <>
      <PageSection>
        <Title className="co-resource-item" headingLevel="h1">
          <ResourceIcon groupVersionKind={NodeNetworkStateModelGroupVersionKind} />
          <span>{nns?.metadata?.name} </span>
        </Title>
      </PageSection>
      <Divider />
      <PageSection>
        <DescriptionList className="pf-c-description-list">
          <DetailItem header={t('Name')} description={nns?.metadata?.name} />
          <DetailItem
            description={
              <MetadataLabels labels={nns?.metadata?.labels} model={NodeNetworkStateModel} />
            }
            header={t('Labels')}
            isEdit
            onEditClick={launchLabelsModal}
            showEditOnTitle
          />
          <DetailItem
            description={annotationsText}
            header={t('Annotations')}
            isEdit
            onEditClick={launchAnnotationsModal}
          />
          <DetailItem
            description={<Timestamp timestamp={nns?.metadata?.creationTimestamp} />}
            header={t('Created at')}
          />
          <OwnerDetailsItem obj={nns} />
        </DescriptionList>
      </PageSection>
    </>
  );
};

export default StateDetailsPage;
