import React, { FC } from 'react';
import { ensurePath } from 'src/utils/helpers';
import { useNMStateTranslation } from 'src/utils/hooks/useNMStateTranslation';

import { RedExclamationCircleIcon } from '@openshift-console/dynamic-plugin-sdk';
import {
  Checkbox,
  Content,
  FormGroup,
  FormHelperText,
  HelperText,
  HelperTextItem,
  Popover,
  TextInput,
  ValidatedOptions,
} from '@patternfly/react-core';
import { HelpIcon } from '@patternfly/react-icons';
import { InterfaceType, NodeNetworkConfigurationInterface } from '@types';

import BondConfiguration from '../../components/BondConfiguration';
import IPConfiguration from '../../components/IPConfiguration';
import NetworkState from '../../components/NetworkState';
import PortConfiguration from '../../components/PortConfiguration';
import { onInterfaceChangeType } from '../../constants';
import { validateInterfaceName } from '../../utils';

import BridgeType from './BridgeType';

type InterfaceDetailsProps = {
  id: number;
  isInterfaceCreated?: boolean;
  policyInterface?: NodeNetworkConfigurationInterface;
  onInterfaceChange?: (updateInterface: onInterfaceChangeType) => void;
  label?: string;
};

const InterfaceDetails: FC<InterfaceDetailsProps> = ({
  id,
  policyInterface,
  onInterfaceChange,
  isInterfaceCreated = true,
  label,
}) => {
  const { t } = useNMStateTranslation();

  const policyInterfaceType = policyInterface?.type;

  const isBridgeType = [InterfaceType.LINUX_BRIDGE, InterfaceType.OVS_BRIDGE].includes(
    policyInterfaceType,
  );

  const handleNameChange = (newName: string) => {
    onInterfaceChange((draftInterface) => (draftInterface.name = newName));
  };

  const onSTPChange = (checked: boolean) => {
    onInterfaceChange((draftInterface) => {
      ensurePath(draftInterface, 'bridge.options');

      draftInterface.bridge.options = {
        stp: { enabled: checked },
      };
    });
  };

  const nameError = validateInterfaceName(policyInterface?.name);

  return (
    <>
      {isBridgeType && (
        <BridgeType
          id={id}
          policyInterface={policyInterface}
          onInterfaceChange={onInterfaceChange}
        />
      )}
      <FormGroup
        label={label || t('Interface name')}
        isRequired
        fieldId={`policy-interface-name-${id}`}
      >
        <TextInput
          isRequired
          id={`policy-interface-name-${id}`}
          name={`policy-interface-name-${id}`}
          value={policyInterface?.name}
          onChange={(_, newValue) => handleNameChange(newValue)}
          isDisabled={isInterfaceCreated}
        />
        {nameError && (
          <FormHelperText>
            <HelperText>
              <HelperTextItem icon={<RedExclamationCircleIcon />} variant={ValidatedOptions.error}>
                {nameError}
              </HelperTextItem>
            </HelperText>
          </FormHelperText>
        )}
      </FormGroup>
      <NetworkState
        id={id}
        policyInterface={policyInterface}
        onInterfaceChange={onInterfaceChange}
      />

      <IPConfiguration
        id={id}
        policyInterface={policyInterface}
        onInterfaceChange={onInterfaceChange}
      />

      {policyInterfaceType !== InterfaceType.ETHERNET && (
        <PortConfiguration
          id={id}
          policyInterface={policyInterface}
          onInterfaceChange={onInterfaceChange}
        />
      )}

      {(policyInterfaceType === InterfaceType.LINUX_BRIDGE ||
        policyInterfaceType === InterfaceType.OVS_BRIDGE) && (
        <FormGroup fieldId={`policy-interface-stp-${id}`}>
          <Checkbox
            label={
              <Content component="p">
                {t('Enable STP')}{' '}
                {isInterfaceCreated && (
                  <Popover
                    aria-label={'Help'}
                    bodyContent={() => <div>{t('Edit the STP in the YAML file')}</div>}
                  >
                    <HelpIcon />
                  </Popover>
                )}
              </Content>
            }
            id={`policy-interface-stp-${id}`}
            isChecked={policyInterface?.bridge?.options?.stp?.enabled !== false}
            onChange={(_, newValue) => onSTPChange(newValue)}
            isDisabled={isInterfaceCreated}
          />
        </FormGroup>
      )}

      {policyInterfaceType === InterfaceType.BOND && (
        <BondConfiguration
          id={id}
          policyInterface={policyInterface}
          onInterfaceChange={onInterfaceChange}
        />
      )}
    </>
  );
};

export default InterfaceDetails;
