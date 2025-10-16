import React, { FC } from 'react';
import { NodeModelGroupVersionKind } from 'src/console-models/NodeModel';

import { IoK8sApiCoreV1Node } from '@kubevirt-ui/kubevirt-api/kubernetes/models';
import { V1NodeNetworkConfigurationPolicy } from '@kubevirt-ui/kubevirt-api/nmstate';
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
import { getAnnotation, getLabel, getName } from '@utils/components/resources/selectors';
import { NODE_HOSTNAME_LABEL } from '@utils/constants';
import { isEmpty } from '@utils/helpers';
import { useNMStateTranslation } from '@utils/hooks/useNMStateTranslation';
import {
  filterPolicyAppliedNodes,
  getPolicyBondingInterfaces,
  getPolicyBridgingInterfaces,
  getPolicyEthernetInterfaces,
} from '@utils/resources/policies/utils';

import InfoBox from './components/InfoBox';
import InterfaceReview from './components/InterfaceReview';

type ReviewStepProps = {
  policy: V1NodeNetworkConfigurationPolicy;
  error?: Error;
};

const ReviewStep: FC<ReviewStepProps> = ({ policy, error }) => {
  const { t } = useNMStateTranslation();

  const ethernetInterfaces = getPolicyEthernetInterfaces(policy);

  const bondingInterfaces = getPolicyBondingInterfaces(policy);
  const bridgeInterfaces = getPolicyBridgingInterfaces(policy);

  const [nodes] = useK8sWatchResource<IoK8sApiCoreV1Node[]>({
    groupVersionKind: NodeModelGroupVersionKind,
    isList: true,
  });

  const qualifiedNodes = filterPolicyAppliedNodes(nodes, policy);

  const qualifiedNodeHostnames = qualifiedNodes.map((node) => getLabel(node, NODE_HOSTNAME_LABEL));

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
              <LevelItem>{getName(policy)}</LevelItem>
            </Level>

            <Level>
              <LevelItem>{t('Policy description')}</LevelItem>
              <LevelItem>{getAnnotation(policy, 'description')}</LevelItem>
            </Level>
            <Level>
              <LevelItem>{t('Node selector')}</LevelItem>
              <LevelItem>
                {qualifiedNodes?.length === nodes?.length ? (
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

      {!isEmpty(ethernetInterfaces) && (
        <InfoBox title={t('Ethernet configuration')} editStepId="policy-wizard-basic-interfaces">
          {ethernetInterfaces.map((iface) => (
            <InterfaceReview policyInterface={iface} key={iface.name} />
          ))}
        </InfoBox>
      )}

      {!isEmpty(bondingInterfaces) && (
        <InfoBox title={t('Bonding configuration')} editStepId="policy-wizard-bonding-interfaces">
          {bondingInterfaces.map((iface) => (
            <InterfaceReview policyInterface={iface} key={iface.name} />
          ))}
        </InfoBox>
      )}
      {!isEmpty(bridgeInterfaces) && (
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
