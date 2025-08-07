import React, { FC, useState } from 'react';
import { Updater } from 'use-immer';

import { V1NodeNetworkConfigurationPolicy } from '@kubevirt-ui/kubevirt-api/nmstate';
import { Content, Form, FormGroup, Radio, Stack, StackItem, Title } from '@patternfly/react-core';
import BondingInterfaceContent from '@utils/components/PolicyForm/PolicyWizard/steps/UplinkConnectionStep/components/BondingInterfaceContent/BondingInterfaceContent';
import SingleInterfaceContent from '@utils/components/PolicyForm/PolicyWizard/steps/UplinkConnectionStep/components/SingleInterfaceContent/SingleInterfaceContent';
import { DEFAULT_OVN_BRIDGE_NAME } from '@utils/components/PolicyForm/PolicyWizard/utils/constants';
import {
  bridgeManagementInterface,
  getInitialBridgeInterface,
  getInitialLinuxBondInterface,
} from '@utils/components/PolicyForm/PolicyWizard/utils/initialState';
import {
  getBridgeName,
  getBridgePorts,
} from '@utils/components/PolicyForm/PolicyWizard/utils/selectors';
import { ConnectionOption } from '@utils/components/PolicyForm/PolicyWizard/utils/types';
import {
  getUplinkConnectionOption,
  updateBridgeName,
  updateBridgeNameAfterOptionChange,
} from '@utils/components/PolicyForm/PolicyWizard/utils/utils';
import { getRandomChars } from '@utils/helpers';
import { useNMStateTranslation } from '@utils/hooks/useNMStateTranslation';
import { getNodeSelector } from '@utils/resources/policies/getters';

import useNodeInterfaces from '../../utils/hooks/useNodeInterfaces/useNodeInterfaces';

import './UplinkConnectionStep.scss';

type UplinkConnectionStepProps = {
  policy: V1NodeNetworkConfigurationPolicy;
  setPolicy: Updater<V1NodeNetworkConfigurationPolicy>;
};

const UplinkConnectionStep: FC<UplinkConnectionStepProps> = ({ setPolicy, policy }) => {
  const { t } = useNMStateTranslation();
  const nodeInterfacesData = useNodeInterfaces(getNodeSelector(policy));
  const [connectionOption, setConnectionOption] = useState<ConnectionOption>(
    getUplinkConnectionOption(policy),
  );

  const handleConnectionOptionChange = (connOption: ConnectionOption) => {
    setConnectionOption(connOption);

    setPolicy((draftPolicy) => {
      const bridgeName = getBridgeName(draftPolicy);

      if (connOption === ConnectionOption.BREX) {
        delete draftPolicy.spec.desiredState.interfaces;
        updateBridgeName(draftPolicy, DEFAULT_OVN_BRIDGE_NAME);
      }

      if (connOption === ConnectionOption.SINGLE_DEVICE) {
        draftPolicy.spec.desiredState.interfaces = [
          getInitialBridgeInterface([]),
          bridgeManagementInterface,
        ];
        // Preserves user-entered name
        updateBridgeNameAfterOptionChange(draftPolicy, bridgeName);
      }

      if (connOption === ConnectionOption.BONDING_INTERFACE) {
        const bondName = `bond-${getRandomChars(10)}`;
        const bridgePorts = getBridgePorts(draftPolicy);
        draftPolicy.spec.desiredState.interfaces = [
          getInitialBridgeInterface([...bridgePorts, { name: bondName }]),
          getInitialLinuxBondInterface(bondName),
          bridgeManagementInterface,
        ];
        // Preserves user-entered name
        updateBridgeNameAfterOptionChange(draftPolicy, bridgeName);
      }
    });
  };

  return (
    <Form className="uplink-connection-step">
      <Title headingLevel="h3">{t('Uplink connection')}</Title>
      <FormGroup fieldId="text">
        <Content component="p">
          {t('Select the network uplink that will provide connectivity to the physical network.')}
        </Content>
      </FormGroup>
      <Stack hasGutter>
        <StackItem>
          <Radio
            description={t('Use the default node network to access the outside physical network.')}
            id="uplink-connection-radio"
            isChecked={connectionOption === ConnectionOption.BREX}
            label={<>{t('Default node network')}</>}
            name="brex"
            onChange={() => handleConnectionOptionChange(ConnectionOption.BREX)}
          />
        </StackItem>
        <StackItem>
          <Radio
            description={t('Select the network interface to access the outside physical network.')}
            id="uplink-connection-radio"
            isChecked={connectionOption === ConnectionOption.SINGLE_DEVICE}
            label={t('A single interface')}
            name="single-interface"
            onChange={() => handleConnectionOptionChange(ConnectionOption.SINGLE_DEVICE)}
          />
          <SingleInterfaceContent
            nodeInterfacesData={nodeInterfacesData}
            policy={policy}
            setPolicy={setPolicy}
            showContent={connectionOption === ConnectionOption.SINGLE_DEVICE}
          />
        </StackItem>
        <StackItem>
          <Radio
            description={t(
              'Configure bond network interfaces to access the outside physical network, to achieve better resilience and higher total throughput.',
            )}
            id="uplink-connection-radio"
            isChecked={connectionOption === ConnectionOption.BONDING_INTERFACE}
            label={t('Bonding interface')}
            name="bonding interface"
            onChange={() => handleConnectionOptionChange(ConnectionOption.BONDING_INTERFACE)}
          />
          <BondingInterfaceContent
            policy={policy}
            setPolicy={setPolicy}
            showContent={connectionOption === ConnectionOption.BONDING_INTERFACE}
          />
        </StackItem>
      </Stack>
    </Form>
  );
};

export default UplinkConnectionStep;
