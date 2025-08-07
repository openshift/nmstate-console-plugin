import React, { FC, useState } from 'react';
import { Updater } from 'use-immer';

import { V1NodeNetworkConfigurationPolicy } from '@kubevirt-ui/kubevirt-api/nmstate';
import { Radio, Split, SplitItem } from '@patternfly/react-core';
import EditButton from '@utils/components/EditButton/EditButton';
import ExternalLink from '@utils/components/ExternalLink/ExternalLink';
import NodeSelectorModal from '@utils/components/NodeSelectorModal/NodeSelectorModal';
import { useNMStateTranslation } from '@utils/hooks/useNMStateTranslation';

type NodeSelectionRadioGroupProps = {
  policy: V1NodeNetworkConfigurationPolicy;
  setPolicy: Updater<V1NodeNetworkConfigurationPolicy>;
};

enum NodeSelectionOptions {
  AllNodes = 'allNodes',
  SelectNodes = 'selectNodes',
}

const NodeSelectionRadioGroup: FC<NodeSelectionRadioGroupProps> = ({ policy, setPolicy }) => {
  const { t } = useNMStateTranslation();
  const [nodeSelectorOpen, setNodeSelectorOpen] = useState(false);
  const [nodeSelectionOption, setNodeSelectionOption] = useState<NodeSelectionOptions>(
    NodeSelectionOptions.AllNodes,
  );

  return (
    <>
      <NodeSelectorModal
        isOpen={nodeSelectorOpen}
        policy={policy}
        onClose={() => setNodeSelectorOpen(false)}
        onSubmit={(newPolicy) => {
          setPolicy(newPolicy);
          setNodeSelectorOpen(false);
        }}
      />
      <Split hasGutter>
        <SplitItem>
          <Radio
            id="node-selection-radio"
            isChecked={nodeSelectionOption === NodeSelectionOptions.AllNodes}
            label={t('Apply to all the nodes on the cluster')}
            name={NodeSelectionOptions.AllNodes}
            onChange={() => setNodeSelectionOption(NodeSelectionOptions.AllNodes)}
          />
        </SplitItem>
        <SplitItem>
          <ExternalLink href="/k8s/cluster/core~v1~Node" label={t('Explore Node list')} />
        </SplitItem>
      </Split>
      <Split hasGutter>
        <SplitItem>
          <Radio
            id="node-selection-radio"
            isChecked={nodeSelectionOption === NodeSelectionOptions.SelectNodes}
            label={t('Apply to specific subsets of Nodes using the Nodes selector')}
            name={NodeSelectionOptions.SelectNodes}
            onChange={() => {
              setNodeSelectionOption(NodeSelectionOptions.SelectNodes);
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
