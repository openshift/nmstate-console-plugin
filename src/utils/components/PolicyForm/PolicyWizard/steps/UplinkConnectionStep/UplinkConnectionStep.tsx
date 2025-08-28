import React, { FC, useState } from 'react';
import { Updater } from 'use-immer';

import { Form, Label, Radio, Stack, StackItem, Title } from '@patternfly/react-core';
import { InterfaceType, V1NodeNetworkConfigurationPolicy } from '@types';
import BondingInterfaceContent from '@utils/components/PolicyForm/PolicyWizard/steps/UplinkConnectionStep/components/BondingInterfaceContent/BondingInterfaceContent';
import SingleInterfaceContent from '@utils/components/PolicyForm/PolicyWizard/steps/UplinkConnectionStep/components/SingleInterfaceContent/SingleInterfaceContent';
import { LINK_AGGREGATION } from '@utils/components/PolicyForm/PolicyWizard/utils/constants';
import { ConnectionOption } from '@utils/components/PolicyForm/PolicyWizard/utils/types';
import { getPolicyInterface } from '@utils/components/PolicyForm/PolicyWizard/utils/utils';
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
  const [connectionOption, setConnectionOption] = useState<ConnectionOption>(ConnectionOption.BREX);

  const handleConnectionOptionChange = (connOption: ConnectionOption) => {
    setConnectionOption(connOption);

    setPolicy((draftPolicy) => {
      const draftInterface = getPolicyInterface(draftPolicy);
      if (connOption === ConnectionOption.BREX) return;

      if (connOption === ConnectionOption.SINGLE_DEVICE) {
        delete draftInterface[LINK_AGGREGATION];
        draftInterface.type = InterfaceType.OVS_BRIDGE;
        draftInterface.bridge = { port: [], options: {} };
      }

      if (connOption === ConnectionOption.BONDING_INTERFACE) {
        delete draftInterface.bridge;
        draftInterface.name = `bond-${getRandomChars(10)}`;
        draftInterface.type = InterfaceType.BOND;
        draftInterface[LINK_AGGREGATION] = {
          mode: '',
          port: [],
        };
      }
    });
  };

  return (
    <Form className="uplink-connection-step">
      <Title headingLevel="h3">{t('Uplink connection')}</Title>
      <Stack hasGutter>
        <StackItem>
          <Radio
            description={t('Use the cluster default NIC')}
            id="uplink-connection-radio"
            isChecked={connectionOption === ConnectionOption.BREX}
            label={
              <>
                {t('brex')}
                <Label
                  className="uplink-connection-step__recommended-label"
                  color="green"
                  variant="outline"
                >
                  {t('Recommended')}
                </Label>
              </>
            }
            name="brex"
            onChange={() => handleConnectionOptionChange(ConnectionOption.BREX)}
          />
        </StackItem>
        <StackItem>
          <Radio
            description={t(
              'Select the physical network interface that will be used to access the outside network',
            )}
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
              'Connect to the outside network through bonded interfaces to achieve better resilience and higher total throughput',
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
