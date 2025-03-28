import React, { FC } from 'react';
import { Updater } from 'use-immer';

import {
  Alert,
  AlertVariant,
  Button,
  ButtonVariant,
  Content,
  Form,
  Popover,
  Title,
} from '@patternfly/react-core';
import { HelpIcon, PlusCircleIcon } from '@patternfly/react-icons';
import {
  InterfaceType,
  NodeNetworkConfigurationInterface,
  V1NodeNetworkConfigurationPolicy,
} from '@types';
import { useNMStateTranslation } from '@utils/hooks/useNMStateTranslation';

import PolicyFormOVSBridgeMapping from '../PolicyFormOVSBridgeMapping';
import PolicyInterfacesExpandable from '../PolicyInterfaceExpandable';
import { isOVSBridgeExisting } from '../utils';

type InterfacesStepProps = {
  policy: V1NodeNetworkConfigurationPolicy;
  setPolicy: Updater<V1NodeNetworkConfigurationPolicy>;
  error?: Error;
};

const InterfacesStep: FC<InterfacesStepProps> = ({ policy, setPolicy, error }) => {
  const { t } = useNMStateTranslation();

  const addNewInterface = () => {
    setPolicy((draftPolicy) => {
      if (!draftPolicy.spec?.desiredState?.interfaces) {
        draftPolicy.spec.desiredState = {
          interfaces: [] as NodeNetworkConfigurationInterface[],
        };
      }

      draftPolicy.spec.desiredState.interfaces.unshift({
        type: InterfaceType.LINUX_BRIDGE,
        name: `interface-${draftPolicy.spec.desiredState.interfaces.length}`,
        state: 'up',
        bridge: {
          options: {
            stp: {
              enabled: false,
            },
          },
        },
      } as NodeNetworkConfigurationInterface);
    });
  };

  const isOVSBridge = isOVSBridgeExisting(policy);

  return (
    <Form>
      <div>
        <Title headingLevel="h3">
          {t('Policy Interface(s)')}{' '}
          <Popover
            aria-label={'Help'}
            bodyContent={t(
              'List of network interfaces that should be created, modified, or removed, as a part of this policy.',
            )}
          >
            <Button variant="plain" hasNoPadding icon={<HelpIcon />} />
          </Popover>
        </Title>
        <Content component="p" className="policy-form-content__add-new-interface pf-v6-u-mt-md">
          <Button
            icon={<PlusCircleIcon />}
            className="pf-m-link--align-left pf-v6-u-ml-md"
            onClick={addNewInterface}
            variant={ButtonVariant.link}
          >
            <span>{t('Add another interface to the policy')}</span>
          </Button>
        </Content>
        <PolicyInterfacesExpandable policy={policy} setPolicy={setPolicy} createForm />
      </div>
      {isOVSBridge && <PolicyFormOVSBridgeMapping policy={policy} setPolicy={setPolicy} />}

      {error && (
        <Alert
          isInline
          variant={AlertVariant.danger}
          title={t('An error occurred')}
          className="pf-v6-u-mt-md"
        >
          {error.message}
        </Alert>
      )}
    </Form>
  );
};

export default InterfacesStep;
