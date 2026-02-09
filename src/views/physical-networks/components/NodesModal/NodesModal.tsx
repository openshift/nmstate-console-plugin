import React, { FC, useState } from 'react';
import { Link } from 'react-router-dom-v5-compat';

import { IoK8sApiCoreV1Node } from '@kubevirt-ui/kubevirt-api/kubernetes/models';
import { ResourceIcon } from '@openshift-console/dynamic-plugin-sdk';
import { Modal, ModalBody, SearchInput } from '@patternfly/react-core';

import { getName } from '@utils/components/resources/selectors';
import { getResourceUrl } from '@utils/helpers';
import { useNMStateTranslation } from '@utils/hooks/useNMStateTranslation';

import { modelToGroupVersionKind } from '../../../../console-models/modelUtils';
import NodeModel from '../../../../console-models/NodeModel';

import './NodesModal.scss';

type NodesModalProps = {
  isOpen: boolean;
  nodes: IoK8sApiCoreV1Node[];
  onClose?: () => void;
};

type NodeData = {
  name: string;
  url: string;
};

const NodesModal: FC<NodesModalProps> = ({ isOpen, nodes, onClose }) => {
  const { t } = useNMStateTranslation();
  const [searchInput, setSearchInput] = useState('');

  const nodesData: NodeData[] = nodes.map((node) => {
    return { name: getName(node), url: getResourceUrl({ model: NodeModel, resource: node }) };
  });
  const filteredNodes = nodesData.filter(({ name }) => name.includes(searchInput));
  const matchingNodesCount = filteredNodes.length;

  return (
    <Modal
      aria-label={t('Nodes modal')}
      className="nodes-modal"
      isOpen={isOpen}
      onClose={onClose}
      variant="small"
    >
      <ModalBody>
        <div className="pf-v6-u-mb-xl">
          {t('{{matchingNodesCount}} matching nodes found', { matchingNodesCount })}
        </div>
        <SearchInput
          aria-label={t('Filter nodes search input')}
          className="pf-v6-u-mb-xl"
          onChange={(_, value) => setSearchInput(value)}
          type="search"
          value={searchInput}
        />
        <div className="nodes-modal__nodes-list">
          {filteredNodes.map(({ name, url }) => (
            <div className="pf-v6-u-mb-md" key={url}>
              <ResourceIcon
                className="pf-v6-u-mr-sm"
                groupVersionKind={modelToGroupVersionKind(NodeModel)}
              />
              <Link to={url}>{name}</Link>
            </div>
          ))}
        </div>
      </ModalBody>
    </Modal>
  );
};

export default NodesModal;
