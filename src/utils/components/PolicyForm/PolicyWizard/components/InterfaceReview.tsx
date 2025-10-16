import React, { FC } from 'react';

import { NodeNetworkConfigurationInterface } from '@kubevirt-ui/kubevirt-api/nmstate';
import { Level, LevelItem, Stack, StackItem } from '@patternfly/react-core';
import { isEmpty } from '@utils/helpers';
import { useNMStateTranslation } from '@utils/hooks/useNMStateTranslation';
import { isSTPEnabled } from '@utils/resources/interfaces/helpers';

import { INTERFACE_TYPE_LABEL } from '../../constants';

type InterfaceReviewProps = {
  policyInterface?: NodeNetworkConfigurationInterface;
};

const InterfaceReview: FC<InterfaceReviewProps> = ({ policyInterface }) => {
  const { t } = useNMStateTranslation();

  const bondConfiguration = policyInterface?.['link-aggregation'];

  return (
    <Stack hasGutter>
      <StackItem>
        <Level>
          <LevelItem>
            {t('{{interfaceType}} name', {
              interfaceType: INTERFACE_TYPE_LABEL[policyInterface.type],
            })}
          </LevelItem>
          <LevelItem>{policyInterface.name}</LevelItem>
        </Level>
      </StackItem>
      <StackItem>
        <Level>
          <LevelItem>{t('Network state')}</LevelItem>
          <LevelItem>{policyInterface.state}</LevelItem>
        </Level>
      </StackItem>
      <StackItem>
        <Level>
          <LevelItem>{t('IP configuration')}</LevelItem>
          <LevelItem>
            {isEmpty(policyInterface?.ipv4) && t('None')}
            {!isEmpty(policyInterface?.ipv4) &&
              (policyInterface?.ipv4.dhcp ? t('DHCP') : t('IP address'))}{' '}
            {!isEmpty(policyInterface?.ipv4) && t('(IPv4)')}
          </LevelItem>
        </Level>
      </StackItem>
      {bondConfiguration?.port && (
        <StackItem>
          <Level>
            <LevelItem>{t('Ports')}</LevelItem>
            <LevelItem>{bondConfiguration.port.join(', ')}</LevelItem>
          </Level>
        </StackItem>
      )}
      {bondConfiguration?.mode && (
        <StackItem>
          <Level>
            <LevelItem>{t('Aggregation mode')}</LevelItem>
            <LevelItem>{bondConfiguration?.mode}</LevelItem>
          </Level>
        </StackItem>
      )}

      {!isEmpty(policyInterface?.bridge?.port) && (
        <StackItem>
          <Level>
            <LevelItem>{t('Underlying interface')}</LevelItem>
            <LevelItem>{policyInterface?.bridge?.port?.[0]?.name}</LevelItem>
          </Level>
        </StackItem>
      )}

      {!isEmpty(policyInterface?.bridge) && (
        <StackItem>
          <Level>
            <LevelItem>{t('STP enabled')}</LevelItem>
            <LevelItem>{isSTPEnabled(policyInterface) ? t('Yes') : t('No')}</LevelItem>
          </Level>
        </StackItem>
      )}
    </Stack>
  );
};

export default InterfaceReview;
