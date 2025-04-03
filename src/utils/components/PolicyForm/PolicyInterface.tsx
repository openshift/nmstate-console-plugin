import React, { FC } from 'react';
import { NodeNetworkConfigurationInterfaceBondMode } from 'src/nmstate-types/custom-models/NodeNetworkConfigurationInterfaceBondMode';
import { ensurePath } from 'src/utils/helpers';
import { useNMStateTranslation } from 'src/utils/hooks/useNMStateTranslation';

import { RedExclamationCircleIcon } from '@openshift-console/dynamic-plugin-sdk';
import {
  Checkbox,
  Content,
  FormGroup,
  FormHelperText,
  FormSelect,
  FormSelectOption,
  FormSelectProps,
  HelperText,
  HelperTextItem,
  Popover,
  TextInput,
  ValidatedOptions,
} from '@patternfly/react-core';
import { HelpIcon } from '@patternfly/react-icons';
import { InterfaceType, NodeNetworkConfigurationInterface } from '@types';
import { OVN_BRIDGE_MAPPINGS } from '@utils/ovn/constants';

import BondConfiguration from './components/BondConfiguration';
import IPConfiguration from './components/IPConfiguration';
import PortConfiguration from './components/PortConfiguration';
import { INTERFACE_TYPE_LABEL, NETWORK_STATES, onInterfaceChangeType } from './constants';
import { doesOVSBridgeExist, validateInterfaceName } from './utils';

type HandleSelectChange = FormSelectProps['onChange'];

type PolicyInterfaceProps = {
  id: number;
  isInterfaceCreated?: boolean;
  policyInterface?: NodeNetworkConfigurationInterface;
  onInterfaceChange?: (updateInterface: onInterfaceChangeType) => void;
  label?: string;
};

const PolicyInterface: FC<PolicyInterfaceProps> = ({
  id,
  policyInterface,
  onInterfaceChange,
  isInterfaceCreated = true,
  label,
}) => {
  const { t } = useNMStateTranslation();

  const handleStateChange: HandleSelectChange = (event, newState: NETWORK_STATES) => {
    onInterfaceChange((draftInterface) => (draftInterface.state = newState));
  };

  const handleNameChange = (newName: string) => {
    onInterfaceChange((draftInterface) => (draftInterface.name = newName));
  };

  const handleTypechange: HandleSelectChange = (event, newType: string) => {
    onInterfaceChange((draftInterface, draftPolicy) => {
      draftInterface.type = newType as InterfaceType;
      !doesOVSBridgeExist(draftPolicy) && delete draftPolicy.spec.desiredState.ovn;

      if (newType === InterfaceType.LINUX_BRIDGE) {
        delete draftInterface['link-aggregation'];
        draftInterface.bridge = { port: [], options: { stp: { enabled: false } } };
      }

      if (newType === InterfaceType.OVS_BRIDGE) {
        delete draftInterface['link-aggregation'];
        draftInterface.bridge = { port: [], options: {} };
        if (!draftPolicy?.spec?.desiredState?.ovn) {
          draftPolicy.spec.desiredState.ovn = {
            [OVN_BRIDGE_MAPPINGS]: [],
          };
        }
        draftPolicy.spec.desiredState.ovn[OVN_BRIDGE_MAPPINGS].push({
          bridge: '',
          localnet: '',
          state: 'present',
        });
      }

      if (newType === InterfaceType.BOND) {
        delete draftInterface.bridge;
        draftInterface['link-aggregation'] = {
          mode: NodeNetworkConfigurationInterfaceBondMode.BALANCE_RR,
          port: [],
        };
      }

      if (newType === InterfaceType.ETHERNET) {
        delete draftInterface.bridge;
        delete draftInterface['link-aggregation'];
      }
    });
  };

  const onSTPChange = (checked: boolean) => {
    onInterfaceChange((draftInterface) => {
      ensurePath(draftInterface, 'bridge.options');

      draftInterface.bridge = {
        options: {
          stp: { enabled: checked },
        },
      };
    });
  };

  const nameError = validateInterfaceName(policyInterface?.name);

  return (
    <>
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
      <FormGroup
        label={t('Network state')}
        isRequired
        fieldId={`policy-interface-network-state-${id}`}
      >
        <FormSelect
          id={`policy-interface-network-state-${id}`}
          onChange={handleStateChange}
          value={policyInterface?.state}
        >
          {Object.entries(NETWORK_STATES).map(([key, value]) => (
            <FormSelectOption key={key} value={value} label={key} />
          ))}
        </FormSelect>
      </FormGroup>

      <FormGroup label={t('Type')} isRequired fieldId={`policy-interface-type-${id}`}>
        <FormSelect
          id={`policy-interface-type-${id}`}
          onChange={handleTypechange}
          value={policyInterface?.type}
          isDisabled={isInterfaceCreated}
        >
          {Object.entries(INTERFACE_TYPE_LABEL).map(([key, value]) => (
            <FormSelectOption key={key} value={key} label={value} />
          ))}
        </FormSelect>
      </FormGroup>

      <IPConfiguration
        id={id}
        policyInterface={policyInterface}
        onInterfaceChange={onInterfaceChange}
      />

      {policyInterface.type !== InterfaceType.ETHERNET && (
        <PortConfiguration
          id={id}
          policyInterface={policyInterface}
          onInterfaceChange={onInterfaceChange}
        />
      )}
      {(policyInterface.type === InterfaceType.LINUX_BRIDGE ||
        policyInterface.type === InterfaceType.OVS_BRIDGE) && (
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

      {policyInterface.type === InterfaceType.BOND && (
        <BondConfiguration
          id={id}
          policyInterface={policyInterface}
          onInterfaceChange={onInterfaceChange}
        />
      )}
    </>
  );
};

export default PolicyInterface;
