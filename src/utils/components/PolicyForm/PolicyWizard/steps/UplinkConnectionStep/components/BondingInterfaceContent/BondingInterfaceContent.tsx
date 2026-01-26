import React, { FC, useState } from 'react';
import { Updater } from 'use-immer';

import { V1NodeNetworkConfigurationPolicy } from '@kubevirt-ui/kubevirt-api/nmstate';
import { FormGroup, Stack, StackItem, TextInput, ValidatedOptions } from '@patternfly/react-core';
import FormGroupHelperText from '@utils/components/FormGroupHelperText/FormGroupHelperText';
import TextWithHelpIcon from '@utils/components/HelpTextIcon/TextWithHelpIcon';
import AggregationModeSelect from '@utils/components/PolicyForm/PolicyWizard/steps/UplinkConnectionStep/components/BondingInterfaceContent/components/AggregationModeSelect';
import useBridgeNameValidation from '@utils/components/PolicyForm/PolicyWizard/utils/hooks/useBridgeNameValidation';
import { getBondName } from '@utils/components/PolicyForm/PolicyWizard/utils/selectors';
import { updateBondName } from '@utils/components/PolicyForm/PolicyWizard/utils/utils';
import { useNMStateTranslation } from '@utils/hooks/useNMStateTranslation';

import NetworkInterfacesSelect from './components/NetworkInterfacesSelect';

import './BondingInterfaceContent.scss';

type BondingInterfaceContentProps = {
  policy: V1NodeNetworkConfigurationPolicy;
  setPolicy: Updater<V1NodeNetworkConfigurationPolicy>;
  showContent: boolean;
};

const BondingInterfaceContent: FC<BondingInterfaceContentProps> = ({
  policy,
  setPolicy,
  showContent,
}) => {
  const { t } = useNMStateTranslation();
  const [nameValidationMessage, setNameValidationMessage] = useState<string>('');
  const validateName = useBridgeNameValidation(policy);

  if (!showContent) return null;

  const handleNameChange = (newName: string) => {
    setPolicy((draftPolicy) => {
      updateBondName(draftPolicy, newName);
    });
    setNameValidationMessage(validateName(newName));
  };

  const nameValidation = nameValidationMessage ? ValidatedOptions.error : ValidatedOptions.default;

  return (
    <Stack className="bonding-interface-content" hasGutter>
      <StackItem>
        <FormGroup label={t('Bonding name')} isRequired fieldId="bonding-name-group">
          <TextInput
            isRequired
            type="text"
            id="bonding-name"
            name="bonding-name"
            validated={nameValidation}
            value={getBondName(policy)}
            onChange={(_, newName) => handleNameChange(newName)}
          />
          <FormGroupHelperText showOnError validated={nameValidation}>
            {nameValidationMessage}
          </FormGroupHelperText>
        </FormGroup>
      </StackItem>
      <StackItem>
        <FormGroup
          label={
            <TextWithHelpIcon
              helpBodyContent={t(
                'These network interfaces will be bonded together. The list contains unused network interfaces available on all of the selected nodes.',
              )}
              helpHeaderContent={t('Network interfaces')}
              text={t('Network interfaces')}
            />
          }
          fieldId="bonding-port"
        >
          <NetworkInterfacesSelect policy={policy} setPolicy={setPolicy} />
        </FormGroup>
      </StackItem>
      <StackItem>
        <FormGroup
          label={
            <TextWithHelpIcon
              helpBodyContent={
                <div>
                  {t('Defines how multiple interfaces work for loading balancing or failover.')}
                </div>
              }
              helpHeaderContent={t('Aggregation mode')}
              text={t('Aggregation mode')}
            />
          }
          isRequired
          fieldId="aggregation-mode-group"
        >
          <AggregationModeSelect policy={policy} setPolicy={setPolicy} />
        </FormGroup>
      </StackItem>
    </Stack>
  );
};

export default BondingInterfaceContent;
