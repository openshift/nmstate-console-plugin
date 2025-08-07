import React, { FC, useState } from 'react';
import { Trans } from 'react-i18next';
import { Updater } from 'use-immer';

import {
  Content,
  Form,
  FormGroup,
  TextInput,
  Title,
  ValidatedOptions,
} from '@patternfly/react-core';
import { V1NodeNetworkConfigurationPolicy } from '@types';
import FormGroupHelperText from '@utils/components/FormGroupHelperText/FormGroupHelperText';
import NodeSelectorModal from '@utils/components/NodeSelectorModal/NodeSelectorModal';
import { getDescription, getName } from '@utils/components/resources/selectors';
import useNNCPs from '@utils/hooks/resources/useNNCPs';
import { useNMStateTranslation } from '@utils/hooks/useNMStateTranslation';

import NodeSelectionRadioGroup from './components/NodeSelectionRadioGroup';

import './BasicInfoStep.scss';

type InfoStepProps = {
  policy: V1NodeNetworkConfigurationPolicy;
  setPolicy: Updater<V1NodeNetworkConfigurationPolicy>;
};

const BasicInfoStep: FC<InfoStepProps> = ({ setPolicy, policy }) => {
  const { t } = useNMStateTranslation();
  const [modalOpen, setModalOpen] = useState(false);
  const [nncps] = useNNCPs();
  const [nameIsValid, setNameIsValid] = useState<boolean>(true);

  const onDescriptionChange = (newDescription: string) => {
    setPolicy(({ metadata }) => {
      if (!metadata.annotations) metadata.annotations = {};

      metadata.annotations.description = newDescription;
    });
  };

  const nameValidation = nameIsValid ? ValidatedOptions.default : ValidatedOptions.error;

  return (
    <Form className="basic-information-step">
      <Title headingLevel="h3">{t('General')}</Title>
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
            In order to allow VirtualMachines to connect to the data center network, a bridge must
            first be created on the nodes. This wizard will guide you through the configuration of
            OVS. You can then expose access to the data center network through this bridge by
            defining a new Virtual Machines network.
          </Trans>
        </Content>
      </FormGroup>
      <NodeSelectionRadioGroup policy={policy} setPolicy={setPolicy} />
      <FormGroup label={t('Name')} isRequired fieldId="policy-name-group">
        <TextInput
          isRequired
          type="text"
          id="policy-name"
          name="policy-name"
          validated={nameValidation}
          value={getName(policy)}
          onChange={(_, newName) => {
            setPolicy((draftPolicy) => {
              draftPolicy.metadata.name = newName;
            });
            setNameIsValid(!nncps?.find((nncp) => getName(nncp) === newName));
          }}
        />
        <FormGroupHelperText validated={nameValidation}>
          {!nameIsValid && t('This name is already in use. Use a different name to continue.')}
        </FormGroupHelperText>
      </FormGroup>
      <FormGroup label={t('Description')} fieldId="policy-description-group">
        <TextInput
          type="text"
          id="policy-description"
          name="policy-description"
          value={getDescription(policy)}
          onChange={(_, newValue) => onDescriptionChange(newValue)}
        />
      </FormGroup>
    </Form>
  );
};

export default BasicInfoStep;
