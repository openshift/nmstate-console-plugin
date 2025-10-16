import React, { FC } from 'react';
import { NodeModelGroupVersionKind } from 'src/console-models/NodeModel';
import { useNMStateTranslation } from 'src/utils/hooks/useNMStateTranslation';

import { IoK8sApiCoreV1Node } from '@kubevirt-ui/kubevirt-api/kubernetes/models';
import {
  NodeNetworkConfigurationInterface,
  V1NodeNetworkConfigurationPolicy,
} from '@kubevirt-ui/kubevirt-api/nmstate';
import { useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';
import {
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  PageSection,
  Skeleton,
  Title,
} from '@patternfly/react-core';

import PolicyEnactments from './PolicyEnactments';
import { getInterfaceToShow, getMatchedPolicyNodes } from './utils';

export type PolicyDetailsPageProps = {
  obj?: V1NodeNetworkConfigurationPolicy;
  iface?: NodeNetworkConfigurationInterface;
};

const PolicyDetailsPage: FC<PolicyDetailsPageProps> = ({ obj: policy, iface }) => {
  const { t } = useNMStateTranslation();

  const [nodes, loaded] = useK8sWatchResource<IoK8sApiCoreV1Node[]>({
    groupVersionKind: NodeModelGroupVersionKind,
    isList: true,
    namespaced: false,
  });

  const policyMatchedNodes = getMatchedPolicyNodes(policy, nodes);
  const interfaceToShow = getInterfaceToShow(policy, iface?.name);

  const dnsResolver = policy?.spec?.desiredState?.['dns-resolver'];

  const description = policy?.metadata?.annotations?.['description'];

  return (
    <div>
      <PageSection>
        <Title headingLevel="h2" className="co-section-heading">
          {t('Policy details')}
        </Title>
        <DescriptionList className="pf-c-description-list">
          <DescriptionListGroup className="pf-c-description-list__group">
            <DescriptionListTerm className="pf-c-description-list__term">
              {t('Name')}
            </DescriptionListTerm>
            <DescriptionListDescription className="pf-c-description-list__description">
              {policy?.metadata?.name}
            </DescriptionListDescription>
          </DescriptionListGroup>
          {description && (
            <DescriptionListGroup className="pf-c-description-list__group">
              <DescriptionListTerm className="pf-c-description-list__term">
                {t('Description')}
              </DescriptionListTerm>
              <DescriptionListDescription className="pf-c-description-list__description">
                {description}
              </DescriptionListDescription>
            </DescriptionListGroup>
          )}
          {interfaceToShow && (
            <>
              <DescriptionListGroup className="pf-c-description-list__group">
                <DescriptionListTerm className="pf-c-description-list__term">
                  {t('Type')}
                </DescriptionListTerm>
                <DescriptionListDescription className="pf-c-description-list__description">
                  {interfaceToShow?.type}
                </DescriptionListDescription>
              </DescriptionListGroup>
              <DescriptionListGroup className="pf-c-description-list__group">
                <DescriptionListTerm className="pf-c-description-list__term">
                  {t('Network state')}
                </DescriptionListTerm>
                <DescriptionListDescription className="pf-c-description-list__description">
                  {interfaceToShow?.state}
                </DescriptionListDescription>
              </DescriptionListGroup>
              <DescriptionListGroup className="pf-c-description-list__group">
                <DescriptionListTerm className="pf-c-description-list__term">
                  {t('IP configuration')}
                </DescriptionListTerm>
                <DescriptionListDescription className="pf-c-description-list__description">
                  {!!interfaceToShow?.ipv4 && t('IPv4')}
                  {!!interfaceToShow?.ipv6 && !interfaceToShow?.ipv4 && t('IPv6')}
                  {!interfaceToShow?.ipv6 && !interfaceToShow?.ipv4 && t('None')}
                </DescriptionListDescription>
              </DescriptionListGroup>
            </>
          )}

          {dnsResolver?.config?.search && (
            <>
              <DescriptionListGroup className="pf-c-description-list__group">
                <DescriptionListTerm className="pf-c-description-list__term">
                  {t('Search')}
                </DescriptionListTerm>
                <DescriptionListDescription className="pf-c-description-list__description">
                  {dnsResolver?.config?.search.join(', ')}
                </DescriptionListDescription>
              </DescriptionListGroup>
            </>
          )}

          {dnsResolver?.config?.server && (
            <>
              <DescriptionListGroup className="pf-c-description-list__group">
                <DescriptionListTerm className="pf-c-description-list__term">
                  {t('Server')}
                </DescriptionListTerm>
                <DescriptionListDescription className="pf-c-description-list__description">
                  {dnsResolver?.config?.server.join(', ')}
                </DescriptionListDescription>
              </DescriptionListGroup>
            </>
          )}

          <>
            <DescriptionListGroup className="pf-c-description-list__group">
              <Title headingLevel="h3">{t('Matched nodes')}</Title>
              <DescriptionListTerm className="pf-c-description-list__term">
                {t('Number of nodes matched')}
              </DescriptionListTerm>
              <DescriptionListDescription className="pf-c-description-list__description">
                {loaded ? policyMatchedNodes?.length : <Skeleton />}
              </DescriptionListDescription>
            </DescriptionListGroup>
            <DescriptionListGroup className="pf-c-description-list__group">
              <DescriptionListTerm className="pf-c-description-list__term">
                {t('Enactments')}
              </DescriptionListTerm>
              <DescriptionListDescription className="pf-c-description-list__description">
                <PolicyEnactments policy={policy} />
              </DescriptionListDescription>
            </DescriptionListGroup>
          </>
        </DescriptionList>
      </PageSection>
    </div>
  );
};

export default PolicyDetailsPage;
