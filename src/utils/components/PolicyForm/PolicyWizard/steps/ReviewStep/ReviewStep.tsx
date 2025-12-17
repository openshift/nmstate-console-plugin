import React, { FC, useState } from 'react';
import { Updater } from 'use-immer';

import { V1NodeNetworkConfigurationPolicy } from '@kubevirt-ui/kubevirt-api/nmstate';
import { k8sCreate } from '@openshift-console/dynamic-plugin-sdk';
import {
  Alert,
  AlertVariant,
  Checkbox,
  Content,
  DescriptionList,
  Split,
  SplitItem,
  Stack,
  StackItem,
  Title,
} from '@patternfly/react-core';
import DetailItem from '@utils/components/DetailItem/DetailItem';
import {
  getBridgePortNames,
  getMTU,
  getOVNBridgeName,
  getOVNLocalnet,
} from '@utils/components/PolicyForm/PolicyWizard/utils/selectors';
import { getDescription, getName } from '@utils/components/resources/selectors';
import SidebarEditor from '@utils/components/SidebarEditor/SidebarEditor';
import { SidebarEditorProvider } from '@utils/components/SidebarEditor/SidebarEditorContext';
import SidebarEditorSwitch from '@utils/components/SidebarEditor/SidebarEditorSwitch';
import { NO_DATA_DASH } from '@utils/constants';
import { isEmpty } from '@utils/helpers';
import { useNMStateTranslation } from '@utils/hooks/useNMStateTranslation';

import NodeNetworkConfigurationPolicyModel from '../../../../../../console-models/NodeNetworkConfigurationPolicyModel';

import './ReviewStep.scss';

type ReviewStepProps = {
  policy: V1NodeNetworkConfigurationPolicy;
  creationError?: Error;
  setPolicy: Updater<V1NodeNetworkConfigurationPolicy>;
};

const ReviewStep: FC<ReviewStepProps> = ({ policy, creationError, setPolicy }) => {
  const { t } = useNMStateTranslation();
  const [openInVMNetworksPage, setOpenInVMNetworksPage] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const handleUpdate = (updatedPolicy: V1NodeNetworkConfigurationPolicy) => {
    setError(null);

    return k8sCreate<V1NodeNetworkConfigurationPolicy>({
      data: updatedPolicy,
      model: NodeNetworkConfigurationPolicyModel,
      queryParams: {
        dryRun: 'All',
      },
    })
      .then(() => setPolicy(updatedPolicy))
      .catch((err) => {
        setError(err);
        return Promise.reject(err);
      });
  };

  const errorMessage = error?.message || creationError?.message;
  const portNames = getBridgePortNames(policy);

  return (
    <SidebarEditorProvider>
      <SidebarEditor
        onResourceUpdate={(updatedPolicy) => handleUpdate(updatedPolicy)}
        resource={policy}
      >
        <Stack>
          <StackItem>
            <Title className="pf-v6-u-mb-lg" headingLevel="h3">
              <Split className="review-step__title-split" hasGutter>
                <SplitItem>{t('Review')}</SplitItem>
                <SplitItem isFilled />
                <SplitItem>
                  <SidebarEditorSwitch />
                </SplitItem>
              </Split>
            </Title>
            <Content className="pf-v6-u-mb-md">
              {t(
                'Make sure all of your configuration details are correct before creating the network.',
              )}
            </Content>
            <DescriptionList
              isHorizontal
              horizontalTermWidthModifier={{
                default: '12ch',
                sm: '15ch',
                md: '20ch',
                lg: '28ch',
                xl: '30ch',
                '2xl': '35ch',
              }}
            >
              {/* TODO Find out what to put here*/}
              <DetailItem header={t('Basic information')} description="NEED INFO" />
              <DetailItem
                header={t('Physical network name')}
                description={getOVNLocalnet(policy) || NO_DATA_DASH}
                testId="review-physical-network-name"
              />
              <DetailItem
                header={t('Node network configuration name')}
                description={getName(policy) || NO_DATA_DASH}
              />
              <DetailItem
                header={t('Network description')}
                description={getDescription(policy) || NO_DATA_DASH}
                testId="review-network-description"
              />
              <DetailItem
                header={t('Uplink connection')}
                description={isEmpty(portNames) ? NO_DATA_DASH : portNames}
              />
              <DetailItem
                header={t('Bridge name')}
                description={getOVNBridgeName(policy) || NO_DATA_DASH}
              />
              <DetailItem header={t('MTU')} description={getMTU(policy) || NO_DATA_DASH} />
            </DescriptionList>
          </StackItem>
          <StackItem isFilled />
          <StackItem>
            {errorMessage && (
              <Alert
                isInline
                variant={AlertVariant.danger}
                title={t('An error occurred')}
                className="pf-v6-u-mb-md"
              >
                {errorMessage}
              </Alert>
            )}
            <Checkbox
              label={t('Create another node network configuration')}
              id="create-new-vm-network"
              isChecked={openInVMNetworksPage}
              onChange={(_, newValue) => setOpenInVMNetworksPage(newValue)}
            />
          </StackItem>
        </Stack>
      </SidebarEditor>
    </SidebarEditorProvider>
  );
};

export default ReviewStep;
