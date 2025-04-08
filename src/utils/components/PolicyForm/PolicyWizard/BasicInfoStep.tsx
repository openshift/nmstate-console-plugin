import React, { FC, useState } from 'react';
import { Trans } from 'react-i18next';
import { useNMStateTranslation } from 'src/utils/hooks/useNMStateTranslation';
import { Updater } from 'use-immer';

import { Content, Form, FormGroup, TextInput, Title } from '@patternfly/react-core';
import { V1NodeNetworkConfigurationPolicy } from '@types';
import NodeSelectorModal from '@utils/components/NodeSelectorModal/NodeSelectorModal';

import ApplySelectorCheckbox from '../components/ApplySelectorCheckbox';

type InfoStepProps = {
  policy: V1NodeNetworkConfigurationPolicy;
  setPolicy: Updater<V1NodeNetworkConfigurationPolicy>;
};

const BasicInfoStep: FC<InfoStepProps> = ({ setPolicy, policy }) => {
  const { t } = useNMStateTranslation();
  const [modalOpen, setModalOpen] = useState(false);

  const onDescriptionChange = (newDescription: string) => {
    setPolicy(({ metadata }) => {
      if (!metadata.annotations) metadata.annotations = {};

      metadata.annotations.description = newDescription;
    });
  };
  return (
    <Form>
      <Title headingLevel="h3">{t('General')}</Title>
      <>
        <NodeSelectorModal
          isOpen={modalOpen}
          policy={policy}
          onClose={() => setModalOpen(false)}
          onSubmit={(newPolicy) => {
            setPolicy(newPolicy);
            setModalOpen(false);
          }}
        />
        <FormGroup fieldId="text">
          <Content component="p">
            <Trans t={t} ns="plugin__nmstate-console-plugin">
              Node network is configured and managed by NM state. Create a node network
              configuration policy to describe the requested network configuration on your nodes in
              the cluster. The node network configuration enactment reports the netwrok policies
              enacted upon each node.
            </Trans>
          </Content>
        </FormGroup>
        <FormGroup fieldId="apply-selector">
          <ApplySelectorCheckbox
            isChecked={!!policy?.spec.nodeSelector}
            onChange={(_, checked) => {
              if (checked) return setModalOpen(true);

              setPolicy((draftPolicy) => {
                delete draftPolicy.spec.nodeSelector;
              });
            }}
          />
        </FormGroup>
      </>
      <FormGroup label={t('Policy name')} isRequired fieldId="policy-name-group">
        <TextInput
          isRequired
          type="text"
          id="policy-name"
          name="policy-name"
          value={policy?.metadata?.name}
          onChange={(_, newName) =>
            setPolicy((draftPolicy) => {
              draftPolicy.metadata.name = newName;
            })
          }
        />
      </FormGroup>
      <FormGroup label={t('Description')} fieldId="policy-description-group">
        <TextInput
          type="text"
          id="policy-description"
          name="policy-description"
          value={policy?.metadata?.annotations?.description}
          onChange={(_, newValue) => onDescriptionChange(newValue)}
        />
      </FormGroup>
    </Form>
  );
};

export default BasicInfoStep;
