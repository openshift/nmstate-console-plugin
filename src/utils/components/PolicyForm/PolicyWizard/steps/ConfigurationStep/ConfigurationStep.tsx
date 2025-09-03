import React, { FC, useState } from 'react';
import { Updater } from 'use-immer';

import {
  Form,
  FormGroup,
  Stack,
  StackItem,
  TextInput,
  Title,
  ValidatedOptions,
} from '@patternfly/react-core';
import { V1NodeNetworkConfigurationPolicy } from '@types';
import FormGroupHelperText from '@utils/components/FormGroupHelperText/FormGroupHelperText';
import TextWithHelpIcon from '@utils/components/HelpTextIcon/TextWithHelpIcon';
import { validateMTU } from '@utils/components/PolicyForm/PolicyWizard/steps/ConfigurationStep/utils/utils';
import useBridgeNameValidation from '@utils/components/PolicyForm/PolicyWizard/utils/hooks/useBridgeNameValidation';
import { getInterfaceName, getMTU } from '@utils/components/PolicyForm/PolicyWizard/utils/utils';
import { useNMStateTranslation } from '@utils/hooks/useNMStateTranslation';

import './ConfigurationStep.scss';

type ConfigurationStepProps = {
  policy: V1NodeNetworkConfigurationPolicy;
  setPolicy: Updater<V1NodeNetworkConfigurationPolicy>;
};

const ConfigurationStep: FC<ConfigurationStepProps> = ({ policy, setPolicy }) => {
  const { t } = useNMStateTranslation();
  const [mtuValidationMessage, setMTUValidationMessage] = useState<string>('');
  const [nameValidationMessage, setNameValidationMessage] = useState<string>('');
  const validateName = useBridgeNameValidation(policy);

  const currentMTU = getMTU(policy);
  const mtuValidation = mtuValidationMessage ? ValidatedOptions.error : ValidatedOptions.default;
  const nameValidation = nameValidationMessage ? ValidatedOptions.error : ValidatedOptions.default;

  const handleMTUChange = (newMTU: string) => {
    setPolicy((draftPolicy) => {
      draftPolicy.spec.desiredState.interfaces[0].mtu = newMTU;
    });
    setMTUValidationMessage(validateMTU(newMTU));
  };

  const handleBridgeNameChange = (newBridgeName: string) => {
    setPolicy((draftPolicy) => {
      draftPolicy.spec.desiredState.interfaces[0].name = newBridgeName;
    });
    setNameValidationMessage(validateName(newBridgeName));
  };

  return (
    <Form className="configuration-step">
      <Title headingLevel="h3">{t('Configuration')}</Title>
      <Stack hasGutter>
        <StackItem className="pf-v6-u-mb-md">
          {t('Configure the core settings for your new network bridge.')}
        </StackItem>
        <StackItem>
          <FormGroup label={t('Bridge name')} isRequired fieldId="bridge-name-group">
            <TextInput
              isRequired
              type="text"
              id="bridge-name"
              name="bridge-name"
              value={getInterfaceName(policy)}
              onChange={(_, newBridgeName) => handleBridgeNameChange(newBridgeName)}
            />
            <FormGroupHelperText validated={nameValidation}>
              {nameValidationMessage}
            </FormGroupHelperText>
          </FormGroup>
        </StackItem>
        <StackItem>
          <FormGroup
            label={
              <TextWithHelpIcon
                helpBodyContent={t(
                  'The largest size of a data packet, in bytes, that can be transmitted across this network. It is critical that the entire underlying physical network infrastructure also supports the same or larger MTU size to avoid packet fragmentation and connectivity issues.',
                )}
                helpHeaderContent={t('MTU')}
                text={t('MTU')}
              />
            }
            fieldId="mtu-group"
          >
            <TextInput
              type="number"
              id="mtu"
              name="mtu"
              validated={mtuValidation}
              value={currentMTU}
              onChange={(_, newMTU) => handleMTUChange(newMTU)}
            />
            <FormGroupHelperText validated={mtuValidation}>
              {mtuValidationMessage}
            </FormGroupHelperText>
          </FormGroup>
        </StackItem>
      </Stack>
    </Form>
  );
};

export default ConfigurationStep;
