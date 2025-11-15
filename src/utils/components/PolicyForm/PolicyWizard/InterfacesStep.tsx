import React, { FC } from 'react';
import { NodeNetworkConfigurationInterfaceBondMode } from 'src/nmstate-types/custom-models/NodeNetworkConfigurationInterfaceBondMode';
import { Updater } from 'use-immer';

import { Button, ButtonVariant, Content, Form, Title } from '@patternfly/react-core';
import { PlusCircleIcon } from '@patternfly/react-icons';
import {
  InterfaceType,
  NodeNetworkConfigurationInterface,
  V1NodeNetworkConfigurationPolicy,
} from '@types';
import { useNMStateTranslation } from '@utils/hooks/useNMStateTranslation';
import { getPolicyInterfaces } from '@utils/resources/policies/utils';

import PolicyFormOVSBridgeMapping from '../components/PolicyFormOVSBridgeMapping';
import { doesOVSBridgeExist } from '../utils';

import InterfaceDetailsExpandableSection from './components/InterfaceDetailsExpandableSection';

type InterfacesStepProps = {
  policy: V1NodeNetworkConfigurationPolicy;
  setPolicy: Updater<V1NodeNetworkConfigurationPolicy>;
  interfaceTypes: InterfaceType[];
  label: string;
};

const InterfacesStep: FC<InterfacesStepProps> = ({ policy, setPolicy, interfaceTypes, label }) => {
  const { t } = useNMStateTranslation();

  const isBindingStep = interfaceTypes?.find((type) => type === InterfaceType.LINUX_BRIDGE);

  const firstInterfaceType = interfaceTypes?.[0];
  const isOVSBridge = isBindingStep && doesOVSBridgeExist(policy);

  const addNewInterface = () => {
    setPolicy((draftPolicy) => {
      if (!draftPolicy.spec?.desiredState?.interfaces) {
        draftPolicy.spec.desiredState = {
          interfaces: [] as NodeNetworkConfigurationInterface[],
        };
      }
      const policyInterfaces = getPolicyInterfaces(draftPolicy);

      const newInterface: NodeNetworkConfigurationInterface = {
        type: firstInterfaceType,
        name: `${firstInterfaceType}-${policyInterfaces.length}`,
        state: 'up',
      };

      if (isBindingStep)
        newInterface.bridge = {
          options: {
            stp: {
              enabled: false,
            },
          },
        };

      if (firstInterfaceType === InterfaceType.BOND) {
        newInterface['link-aggregation'] = {
          mode: NodeNetworkConfigurationInterfaceBondMode.BALANCE_RR,
          port: [],
        };
      }

      if (isOVSBridge) {
        newInterface.bridge['allow-extra-patch-ports'] = true;
      }

      policyInterfaces.push(newInterface);
    });
  };

  return (
    <Form>
      <div>
        <Title headingLevel="h3">{label}</Title>
        <InterfaceDetailsExpandableSection
          policy={policy}
          setPolicy={setPolicy}
          interfaceTypes={interfaceTypes}
        />
        <Content component="p" className="policy-form-content__add-new-interface pf-v6-u-mt-md">
          <Button
            icon={<PlusCircleIcon />}
            className="pf-m-link--align-left pf-v6-u-ml-md"
            onClick={addNewInterface}
            variant={ButtonVariant.link}
          >
            <span>{t('Add another {{label}} interface', { label: label.toLowerCase() })}</span>
          </Button>
        </Content>
      </div>
      {isOVSBridge && <PolicyFormOVSBridgeMapping policy={policy} setPolicy={setPolicy} />}
    </Form>
  );
};

export default InterfacesStep;
