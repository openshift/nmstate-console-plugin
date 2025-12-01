import React, { FC, useState } from 'react';
import { ensurePath } from 'src/utils/helpers';
import { useNMStateTranslation } from 'src/utils/hooks/useNMStateTranslation';

import {
  InterfaceType,
  NodeNetworkConfigurationInterface,
  NodeNetworkConfigurationInterfaceBondMode,
} from '@kubevirt-ui/kubevirt-api/nmstate';
import { RedExclamationCircleIcon } from '@openshift-console/dynamic-plugin-sdk';
import {
  Checkbox,
  Content,
  Dropdown,
  DropdownItem,
  DropdownList,
  FormGroup,
  FormHelperText,
  HelperText,
  HelperTextItem,
  Popover,
  TextInput,
  ValidatedOptions,
} from '@patternfly/react-core';
import { HelpIcon } from '@patternfly/react-icons';
import DropdownToggle from '@utils/components/Toggles/DropdownToggle';
import { OVN_BRIDGE_MAPPINGS } from '@utils/resources/ovn/constants';

import BondConfiguration from './components/BondConfiguration';
import IPConfiguration from './components/IPConfiguration';
import PortConfiguration from './components/PortConfiguration';
import { INTERFACE_TYPE_LABEL, NETWORK_STATES, onInterfaceChangeType } from './constants';
import { doesOVSBridgeExist, validateInterfaceName } from './utils';

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
  const [isNetworkStateOpen, setIsNetworkStateOpen] = useState(false);
  const [isTypeOpen, setIsTypeOpen] = useState(false);

  const handleStateChange = (_event: React.MouseEvent, newState: NETWORK_STATES) => {
    onInterfaceChange((draftInterface) => (draftInterface.state = newState));
    setIsNetworkStateOpen(false);
  };

  const handleNameChange = (newName: string) => {
    onInterfaceChange((draftInterface) => (draftInterface.name = newName));
  };

  const handleTypechange = (_event: React.MouseEvent, newType: string) => {
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
    setIsTypeOpen(false);
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
        <Dropdown
          id={`policy-interface-network-state-${id}`}
          isOpen={isNetworkStateOpen}
          onOpenChange={(isOpen) => setIsNetworkStateOpen(isOpen)}
          onSelect={handleStateChange}
          toggle={DropdownToggle({
            children:
              (policyInterface?.state &&
                Object.entries(NETWORK_STATES).find(
                  ([, value]) => value === policyInterface?.state,
                )?.[0]) ||
              policyInterface?.state,
            isExpanded: isNetworkStateOpen,
            onClick: () => setIsNetworkStateOpen(!isNetworkStateOpen),
            isFullWidth: true,
          })}
        >
          <DropdownList>
            {Object.entries(NETWORK_STATES).map(([key, value]) => (
              <DropdownItem key={key} value={value}>
                {key}
              </DropdownItem>
            ))}
          </DropdownList>
        </Dropdown>
      </FormGroup>

      <FormGroup label={t('Type')} isRequired fieldId={`policy-interface-type-${id}`}>
        <Dropdown
          id={`policy-interface-type-${id}`}
          isOpen={isTypeOpen}
          onOpenChange={(isOpen) => setIsTypeOpen(isOpen)}
          onSelect={handleTypechange}
          toggle={DropdownToggle({
            children:
              (policyInterface?.type && INTERFACE_TYPE_LABEL[policyInterface.type]) ||
              policyInterface?.type,
            isExpanded: isTypeOpen,
            onClick: () => !isInterfaceCreated && setIsTypeOpen(!isTypeOpen),
            isDisabled: isInterfaceCreated,
            isFullWidth: true,
          })}
        >
          <DropdownList>
            {Object.entries(INTERFACE_TYPE_LABEL).map(([key, value]) => (
              <DropdownItem key={key} value={key}>
                {value}
              </DropdownItem>
            ))}
          </DropdownList>
        </Dropdown>
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
