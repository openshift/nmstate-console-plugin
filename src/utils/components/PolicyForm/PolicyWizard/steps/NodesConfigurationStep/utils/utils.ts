import { getResourceUrl, labelsToParams } from '@utils/helpers';

import NodeModel from '../../../../../../../console-models/NodeModel';

export const getNodesURL = (labels: Record<string, string>) =>
  `${getResourceUrl({ model: NodeModel })}?${labelsToParams(labels)}`;
