import {
  ComponentFactory,
  DefaultEdge,
  GraphComponent,
  ModelKind,
  nodeDragSourceSpec,
  withDragNode,
  withPanZoom,
  withSelection,
} from '@patternfly/react-topology';

import CustomGroup from '../components/CustomGroup/CustomGroup';
import CustomNode from '../components/CustomNode/CustomNode';

import { GROUP } from './constants';
import { LevelsLayout } from './LevelsLayout';

export const layoutFactory = (type, graph) => {
  return new LevelsLayout(graph, { layoutOnDrag: true });
};

export const componentFactory: ComponentFactory = (kind: ModelKind, type: string) => {
  switch (type) {
    case GROUP:
      return withDragNode(nodeDragSourceSpec(GROUP))(withSelection()(CustomGroup));
    default:
      switch (kind) {
        case ModelKind.graph:
          return withPanZoom()(GraphComponent);
        case ModelKind.node:
          return withDragNode(nodeDragSourceSpec(ModelKind.node, true, true))(
            withSelection()(CustomNode),
          );
        case ModelKind.edge:
          return DefaultEdge;
        default:
          return undefined;
      }
  }
};
