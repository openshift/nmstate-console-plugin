import React, { FC, useState } from 'react';
import { Updater } from 'use-immer';

import { V1NodeNetworkConfigurationPolicy } from '@kubevirt-ui/kubevirt-api/nmstate';
import { Form, FormGroup, TextInput, Title, ValidatedOptions } from '@patternfly/react-core';
import FormGroupHelperText from '@utils/components/FormGroupHelperText/FormGroupHelperText';
import NodeSelectorModal from '@utils/components/NodeSelectorModal/NodeSelectorModal';
import NodesOverlapAlert from '@utils/components/PolicyForm/PolicyWizard/steps/NodesConfigurationStep/components/NodesOverlapAlert';
import useNNCPNodesConflicts from '@utils/components/PolicyForm/PolicyWizard/utils/hooks/useNNCPNodesConflicts/useNNCPNodesConflicts';
import { getDescription, getName } from '@utils/components/resources/selectors';
import useNNCPs from '@utils/hooks/resources/NNCPs/useNNCPs';
import { useNMStateTranslation } from '@utils/hooks/useNMStateTranslation';

import NodeSelectionRadioGroup from './components/NodeSelectionRadioGroup';

import './NodesConfigurationStep.scss';

type NodesConfigurationStepProps = {
  policy: V1NodeNetworkConfigurationPolicy;
  setPolicy: Updater<V1NodeNetworkConfigurationPolicy>;
};

const NodesConfigurationStep: FC<NodesConfigurationStepProps> = ({ setPolicy, policy }) => {
  const { t } = useNMStateTranslation();
  const [modalOpen, setModalOpen] = useState(false);
  const [nncps] = useNNCPs();
  const [nameIsValid, setNameIsValid] = useState<boolean>(true);
  const nodeConflicts = useNNCPNodesConflicts(policy);

  const onDescriptionChange = (newDescription: string) => {
    setPolicy(({ metadata }) => {
      if (!metadata.annotations) metadata.annotations = {};

      metadata.annotations.description = newDescription;
    });
  };

  const nameValidation = nameIsValid ? ValidatedOptions.default : ValidatedOptions.error;

  return (
    <Form className="nodes-configuration-step">
      <Title headingLevel="h3">{t('Nodes configuration')}</Title>
      <NodeSelectorModal
        isOpen={modalOpen}
        policy={policy}
        onClose={() => setModalOpen(false)}
        onSubmit={(newPolicy) => {
          setPolicy(newPolicy);
          setModalOpen(false);
        }}
      />
      <NodeSelectionRadioGroup policy={policy} setPolicy={setPolicy} />
      <NodesOverlapAlert currentPolicy={policy} nncpNodeConflicts={nodeConflicts} />
      <Title className="pf-v6-u-mt-lg" headingLevel="h4">
        {t('Details')}
      </Title>
      <FormGroup
        label={t('Node network configuration name')}
        isRequired
        fieldId="policy-name-group"
      >
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
        <FormGroupHelperText showOnError validated={nameValidation}>
          {t('This name is already in use. Use a different name to continue.')}
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

export default NodesConfigurationStep;
