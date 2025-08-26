import React, { FC } from 'react';
import { Updater } from 'use-immer';

import { Button, ButtonVariant, Content, Popover, Title } from '@patternfly/react-core';
import { HelpIcon, PlusCircleIcon } from '@patternfly/react-icons';
import { V1NodeNetworkConfigurationPolicy } from '@types';
import { useNMStateTranslation } from '@utils/hooks/useNMStateTranslation';
import { OVN_BRIDGE_MAPPINGS } from '@utils/resources/ovn/constants';

import PolicyFormOVSBridgeMappingExpandable from './PolicyFormOVSBridgeMappingExpandable';

type PolicyFormOVSBridgeMappingProps = {
  policy: V1NodeNetworkConfigurationPolicy;
  setPolicy: Updater<V1NodeNetworkConfigurationPolicy>;
};

const PolicyFormOVSBridgeMapping: FC<PolicyFormOVSBridgeMappingProps> = ({ policy, setPolicy }) => {
  const { t } = useNMStateTranslation();

  return (
    <div>
      <Title headingLevel="h3">
        {t('Open vSwitch bridge mapping')}{' '}
        <Popover
          aria-label={'Help'}
          bodyContent={t(
            'The Open vSwitch bridge mapping is a list of Open vSwitch bridges and the physical interfaces that are connected to them.',
          )}
        >
          <Button variant="plain" hasNoPadding icon={<HelpIcon />} />
        </Popover>
      </Title>
      <Content component="p" className="policy-form-content__add-new-interface pf-v6-u-mt-md">
        <Button
          icon={<PlusCircleIcon />}
          className="pf-m-link--align-left pf-v6-u-ml-md"
          onClick={() =>
            setPolicy((draftPolicy) => {
              draftPolicy.spec.desiredState.ovn[OVN_BRIDGE_MAPPINGS].unshift({
                bridge: '',
                localnet: '',
                state: 'present',
              });
            })
          }
          variant={ButtonVariant.link}
        >
          <span>{t('Add mapping')}</span>
        </Button>
      </Content>
      <PolicyFormOVSBridgeMappingExpandable policy={policy} setPolicy={setPolicy} />
    </div>
  );
};

export default PolicyFormOVSBridgeMapping;
