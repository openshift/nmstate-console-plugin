import React, { FC, useMemo } from 'react';
import { Link } from 'react-router';
import NodeNetworkConfigurationPolicyModel, {
  NodeNetworkConfigurationPolicyModelGroupVersionKind,
} from '../../../../console-models/NodeNetworkConfigurationPolicyModel';

import { IoK8sApiCoreV1Node } from '@kubevirt-ui/kubevirt-api/kubernetes/models';
import { V1NodeNetworkConfigurationPolicy } from '@kubevirt-ui/kubevirt-api/nmstate';
import { ResourceLink, useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';
import { Spinner, Title } from '@patternfly/react-core';
import { Table, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';
import { getResourceUrl } from '@utils/helpers';
import { useNMStateTranslation } from '@utils/hooks/useNMStateTranslation';
import { isPolicyAppliedInNode } from '@utils/resources/policies/utils';

import { formatPolicyAffectsDisplay } from './utils/formatPolicyAffectsDisplay';

type NodeNetworkingPoliciesPanelProps = {
  node: IoK8sApiCoreV1Node;
};

const NodeNetworkingPoliciesPanel: FC<NodeNetworkingPoliciesPanelProps> = ({ node }) => {
  const { t } = useNMStateTranslation();

  const [policies, policiesLoaded, policiesLoadError] = useK8sWatchResource<
    V1NodeNetworkConfigurationPolicy[]
  >({
    groupVersionKind: NodeNetworkConfigurationPolicyModelGroupVersionKind,
    isList: true,
    namespaced: false,
  });

  const policiesForNode = useMemo(
    () =>
      policies
        ?.filter((policy) => isPolicyAppliedInNode(policy, node))
        .sort((a, b) => (a.metadata?.name || '').localeCompare(b.metadata?.name || '')) ?? [],
    [policies, node],
  );

  const policiesListUrl = getResourceUrl({ model: NodeNetworkConfigurationPolicyModel });

  return (
    <div className="nmstate-node-topology__policies-panel">
      <Title className="nmstate-node-topology__policies-panel-title" headingLevel="h2">
        {t('Networking policies affecting this node')}
      </Title>
      <p className="nmstate-node-topology__policies-panel-desc">
        {t(
          'NodeNetworkConfigurationPolicies that have been applied or are pending for this node, defining how its interfaces, VLANs, bonds, and other network settings are managed.',
        )}
      </p>

      {!policiesLoaded && !policiesLoadError && (
        <div className="nmstate-node-topology__policies-panel-loading">
          <Spinner size="lg" />
        </div>
      )}

      {policiesLoadError && (
        <p className="nmstate-node-topology__policies-panel-error">{policiesLoadError.message}</p>
      )}

      {policiesLoaded && !policiesLoadError && (
        <>
          <Table
            aria-label={t('Networking policies affecting this node')}
            borders
            className="nmstate-node-topology__policies-panel-table"
            variant="compact"
          >
            <Thead>
              <Tr>
                <Th>{t('Name')}</Th>
                <Th>{t('Affects')}</Th>
              </Tr>
            </Thead>
            <Tbody>
              {policiesForNode.length === 0 ? (
                <Tr>
                  <Td colSpan={2}>
                    <span className="nmstate-node-topology__policies-panel-muted">
                      {t('No networking policies apply to this node.')}
                    </span>
                  </Td>
                </Tr>
              ) : (
                policiesForNode.map((policy) => (
                  <Tr key={policy.metadata?.uid || policy.metadata?.name}>
                    <Td data-label={t('Name')}>
                      <ResourceLink
                        groupVersionKind={NodeNetworkConfigurationPolicyModelGroupVersionKind}
                        name={policy.metadata.name}
                      />
                    </Td>
                    <Td data-label={t('Affects')}>{formatPolicyAffectsDisplay(policy)}</Td>
                  </Tr>
                ))
              )}
            </Tbody>
          </Table>

          <Link className="nmstate-node-topology__policies-panel-footer-link" to={policiesListUrl}>
            {t('See all NodeNetworkConfigurationPolicies')}
          </Link>
        </>
      )}
    </div>
  );
};

export default NodeNetworkingPoliciesPanel;
