import React, { FC } from 'react';
import { NodeModelGroupVersionKind } from 'src/console-models/NodeModel';

import { IoK8sApiCoreV1Node } from '@kubevirt-ui/kubevirt-api/kubernetes/models';
import { useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';
import {
  Alert,
  AlertVariant,
  Content,
  Form,
  Level,
  LevelItem,
  Stack,
  StackItem,
  Title,
} from '@patternfly/react-core';
import {
  InterfaceType,
  NodeNetworkConfigurationInterface,
  V1NodeNetworkConfigurationPolicy,
} from '@types';
import { NODE_HOSTNAME_LABEL } from '@utils/constants';
import { useNMStateTranslation } from '@utils/hooks/useNMStateTranslation';
import { filterPolicyAppliedNodes } from '@utils/policies/utils';

import InfoBox from './components/InfoBox';
import InterfaceReview from './components/InterfaceReview';

type ReviewStepProps = {
  policy: V1NodeNetworkConfigurationPolicy;
  error?: Error;
};

const ReviewStep: FC<ReviewStepProps> = ({ policy, error }) => {
  const { t } = useNMStateTranslation();

  const ethernetInterfaces: NodeNetworkConfigurationInterface[] =
    policy.spec?.desiredState?.interfaces?.filter(
      (iface) => iface.type === InterfaceType.ETHERNET,
    ) || [];
  const bondingInterfaces: NodeNetworkConfigurationInterface[] =
    policy.spec?.desiredState?.interfaces?.filter((iface) => iface.type === InterfaceType.BOND) ||
    [];
  const bridgeInterfaces: NodeNetworkConfigurationInterface[] =
    policy.spec?.desiredState?.interfaces?.filter((iface) =>
      [InterfaceType.LINUX_BRIDGE, InterfaceType.OVS_BRIDGE].includes(iface.type),
    ) || [];

  const [nodes] = useK8sWatchResource<IoK8sApiCoreV1Node[]>({
    groupVersionKind: NodeModelGroupVersionKind,
    isList: true,
  });

  const qualifiedNodes = filterPolicyAppliedNodes(nodes, policy);

  const qualifiedNodeHostnames = qualifiedNodes.map(
    (node) => node.metadata?.labels?.[NODE_HOSTNAME_LABEL],
  );

  return (
    <Form>
      <Title headingLevel="h3">{t('Review')}</Title>
      <Content>
        {t('Make sure all of your configuration details are correct before deploying the policy.')}
      </Content>

      <InfoBox title={t('Basic policy info')} editStepId="policy-wizard-basicinfo">
        <Stack hasGutter>
          <StackItem>
            <Level>
              <LevelItem>{t('Policy name')}</LevelItem>
              <LevelItem>{policy.metadata.name}</LevelItem>
            </Level>

            <Level>
              <LevelItem>{t('Policy description')}</LevelItem>
              <LevelItem>{policy.metadata.annotations?.description}</LevelItem>
            </Level>
            <Level>
              <LevelItem>{t('Node selector')}</LevelItem>
              <LevelItem>
                {qualifiedNodes.length === nodes.length ? (
                  t('Applies to all nodes')
                ) : (
                  <>
                    {' '}
                    {t('Applies to nodes with hostname: ')} {qualifiedNodeHostnames?.join(', ')}
                  </>
                )}
              </LevelItem>
            </Level>
          </StackItem>
        </Stack>
      </InfoBox>

      {ethernetInterfaces.length > 0 && (
        <InfoBox title={t('Ethernet configuration')} editStepId="policy-wizard-basic-interfaces">
          {ethernetInterfaces.map((iface) => (
            <InterfaceReview policyInterface={iface} key={iface.name} />
          ))}
        </InfoBox>
      )}

      {bondingInterfaces.length > 0 && (
        <InfoBox title={t('Bonding configuration')} editStepId="policy-wizard-bonding-interfaces">
          {bondingInterfaces.map((iface) => (
            <InterfaceReview policyInterface={iface} key={iface.name} />
          ))}
        </InfoBox>
      )}
      {bridgeInterfaces.length > 0 && (
        <InfoBox title={t('Bridge configuration')} editStepId="policy-wizard-bridge-interfaces">
          {bridgeInterfaces.map((iface) => (
            <InterfaceReview policyInterface={iface} key={iface.name} />
          ))}
        </InfoBox>
      )}

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

export default ReviewStep;
