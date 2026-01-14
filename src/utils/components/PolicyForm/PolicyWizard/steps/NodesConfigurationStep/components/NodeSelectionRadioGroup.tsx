import React, { FC, useMemo, useState } from 'react';
import { Updater } from 'use-immer';

import { V1NodeNetworkConfigurationPolicy } from '@kubevirt-ui/kubevirt-api/nmstate';
import { Radio, Split, SplitItem } from '@patternfly/react-core';
import EditButton from '@utils/components/EditButton/EditButton';
import ExternalLink from '@utils/components/ExternalLink/ExternalLink';
import NodeSelectorModal from '@utils/components/NodeSelectorModal/NodeSelectorModal';
import { NodeSelectionOptions } from '@utils/components/PolicyForm/PolicyWizard/steps/NodesConfigurationStep/utils/types';
import { isOnlyWorkerLabel } from '@utils/components/PolicyForm/PolicyWizard/steps/NodesConfigurationStep/utils/utils';
import { useNMStateTranslation } from '@utils/hooks/useNMStateTranslation';
import { getNodeSelector } from '@utils/resources/policies/getters';

import { WORKER_NODE_LABEL } from '../../../utils/constants';

type NodeSelectionRadioGroupProps = {
  policy: V1NodeNetworkConfigurationPolicy;
  setPolicy: Updater<V1NodeNetworkConfigurationPolicy>;
};

const NodeSelectionRadioGroup: FC<NodeSelectionRadioGroupProps> = ({ policy, setPolicy }) => {
  const { t } = useNMStateTranslation();
  const [nodeSelectorOpen, setNodeSelectorOpen] = useState(false);

  // Derive the selection option from the policy state
  const nodeSelectionOption = useMemo(() => {
    const nodeSelector = getNodeSelector(policy);
    return nodeSelector && !isOnlyWorkerLabel(nodeSelector)
      ? NodeSelectionOptions.SelectNodes
      : NodeSelectionOptions.AllNodes;
  }, [policy]);

  return (
    <>
      {nodeSelectorOpen && (
        <NodeSelectorModal
          isOpen
          policy={policy}
          onClose={() => setNodeSelectorOpen(false)}
          onSubmit={(newPolicy) => {
            setPolicy(newPolicy);
            setNodeSelectorOpen(false);
          }}
        />
      )}
      <Split hasGutter>
        <SplitItem>
          <Radio
            id="node-selection-radio-all"
            isChecked={nodeSelectionOption === NodeSelectionOptions.AllNodes}
            label={t('Apply to all the nodes on the cluster')}
            name="node-selection-radio-group"
            onChange={() => {
              setPolicy((draftPolicy) => {
                draftPolicy.spec.nodeSelector = { [WORKER_NODE_LABEL]: '' };
              });
            }}
          />
        </SplitItem>
        <SplitItem>
          <ExternalLink href="/k8s/cluster/core~v1~Node" label={t('Explore Node list')} />
        </SplitItem>
      </Split>
      <Split hasGutter>
        <SplitItem>
          <Radio
            id="node-selection-radio-select"
            isChecked={nodeSelectionOption === NodeSelectionOptions.SelectNodes}
            label={t('Apply to specific subsets of Nodes using the Nodes selector')}
            name="node-selection-radio-group"
            onChange={() => {
              setPolicy((draftPolicy) => {
                draftPolicy.spec.nodeSelector = { [WORKER_NODE_LABEL]: '' };
              });
              setNodeSelectorOpen(true);
            }}
          />
        </SplitItem>
        <SplitItem>
          <EditButton
            iconPosition="end"
            isEditable
            onEditClick={() => setNodeSelectorOpen(true)}
            testId="node-selector-link"
          >
            {t('View matching Nodes')}
          </EditButton>
        </SplitItem>
      </Split>
    </>
  );
};

export default NodeSelectionRadioGroup;
