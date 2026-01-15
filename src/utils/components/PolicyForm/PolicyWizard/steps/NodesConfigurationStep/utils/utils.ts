import { WORKER_NODE_LABEL } from '@utils/components/PolicyForm/PolicyWizard/utils/constants';
import { getResourceUrl, labelsToParams } from '@utils/helpers';

import NodeModel from '../../../../../../../console-models/NodeModel';

export const getNodesURL = (labels: Record<string, string>) =>
  `${getResourceUrl({ model: NodeModel })}?${labelsToParams(labels)}`;

export const isOnlyWorkerLabel = (nodeSelector: Record<string, string>) =>
  Object.keys(nodeSelector).length === 1 && WORKER_NODE_LABEL in nodeSelector;
