import React, { FC, useState } from 'react';
import { Trans } from 'react-i18next';
import { Updater } from 'use-immer';

import { V1NodeNetworkConfigurationPolicy } from '@kubevirt-ui/kubevirt-api/nmstate';
import {
  Content,
  Form,
  FormGroup,
  TextInput,
  Title,
  ValidatedOptions,
} from '@patternfly/react-core';
import FormGroupHelperText from '@utils/components/FormGroupHelperText/FormGroupHelperText';
import { getOVNLocalnet } from '@utils/components/PolicyForm/PolicyWizard/utils/selectors';
import { useNMStateTranslation } from '@utils/hooks/useNMStateTranslation';
import { OVN_BRIDGE_MAPPINGS } from '@utils/resources/ovn/constants';

import './NetworkIdentity.scss';

type NetworkIdentityProps = {
  policy: V1NodeNetworkConfigurationPolicy;
  setPolicy: Updater<V1NodeNetworkConfigurationPolicy>;
};

const NetworkIdentity: FC<NetworkIdentityProps> = ({ setPolicy, policy }) => {
  const { t } = useNMStateTranslation();
  const [nameIsValid, setNameIsValid] = useState<boolean>(true);

  const nameValidation = nameIsValid ? ValidatedOptions.default : ValidatedOptions.error;

  return (
    <Form className="network-identity-step">
      <Title headingLevel="h3">{t('Network identity')}</Title>
      <FormGroup fieldId="text">
        <Content component="p">
          <Trans t={t} ns="plugin__nmstate-console-plugin">
            Let&apos;s configure Open vSwitch (OVS). First, to allow VirtualMachines (VMs) to
            connect to the data center network, a bridge must be created on the nodes. Then, you can
            expose access to the data center network through this bridge by defining a new VM
            network.
          </Trans>
        </Content>
      </FormGroup>
      <FormGroup
        label={t('Physical network name')}
        isRequired
        fieldId="physical-network-name-group"
      >
        <TextInput
          isRequired
          type="text"
          id="physical-network-name"
          name="physical-network-name"
          validated={nameValidation}
          value={getOVNLocalnet(policy)}
          onChange={(_, newName) => {
            setPolicy((draftPolicy) => {
              draftPolicy.spec.desiredState.ovn[OVN_BRIDGE_MAPPINGS][0].localnet = newName;
            });
            // TODO Fix validation
            setNameIsValid(true);
          }}
        />
        <FormGroupHelperText showOnError validated={nameValidation}>
          {t('This name is already in use. Use a different name to continue.')}
        </FormGroupHelperText>
      </FormGroup>
    </Form>
  );
};

export default NetworkIdentity;
