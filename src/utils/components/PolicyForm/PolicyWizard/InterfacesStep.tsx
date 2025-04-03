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

import PolicyFormOVSBridgeMapping from '../components/PolicyFormOVSBridgeMapping';
import { isOVSBridgeExisting } from '../utils';

import InterfaceDetailsExpandable from './components/InterfaceDetailsExpandable';

type InterfacesStepProps = {
  policy: V1NodeNetworkConfigurationPolicy;
  setPolicy: Updater<V1NodeNetworkConfigurationPolicy>;
  interfaceTypes: InterfaceType[];
  label: string;
};

const InterfacesStep: FC<InterfacesStepProps> = ({ policy, setPolicy, interfaceTypes, label }) => {
  const { t } = useNMStateTranslation();

  const bindingStep = interfaceTypes?.find((type) => type === InterfaceType.LINUX_BRIDGE);

  const addNewInterface = () => {
    setPolicy((draftPolicy) => {
      if (!draftPolicy.spec?.desiredState?.interfaces) {
        draftPolicy.spec.desiredState = {
          interfaces: [] as NodeNetworkConfigurationInterface[],
        };
      }

      const newInterface: NodeNetworkConfigurationInterface = {
        type: interfaceTypes?.[0],
        name: `${interfaceTypes?.[0]}-${draftPolicy.spec.desiredState.interfaces.length}`,
        state: 'up',
      };

      if (bindingStep)
        newInterface.bridge = {
          options: {
            stp: {
              enabled: false,
            },
          },
        };

      if (interfaceTypes?.[0] === InterfaceType.BOND) {
        newInterface['link-aggregation'] = {
          mode: NodeNetworkConfigurationInterfaceBondMode.BALANCE_RR,
          port: [],
        };
      }

      draftPolicy.spec.desiredState.interfaces.push(newInterface);
    });
  };

  const isOVSBridge = bindingStep && isOVSBridgeExisting(policy);

  return (
    <Form>
      <div>
        <Title headingLevel="h3">{label}</Title>
        <InterfaceDetailsExpandable
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
