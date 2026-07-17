import React, { FC, useEffect, useMemo, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router';

import { IoK8sApiCoreV1Node } from '@kubevirt-ui/kubevirt-api/kubernetes/models';
import { Flex, FlexItem } from '@patternfly/react-core';
import {
  ModelKind,
  SELECTION_EVENT,
  Visualization,
  VisualizationProvider,
} from '@patternfly/react-topology';

import NodeNetworkingPoliciesPanel from '@utils/topology/components/NodeNetworkingPoliciesPanel/NodeNetworkingPoliciesPanel';
import { SELECTED_ID_QUERY_PARAM } from '@utils/topology/components/TopologySidebar/constants';
import { GRAPH_POSITIONING_EVENT, NODE_POSITIONING_EVENT } from '@utils/topology/utils/constants';
import { componentFactory, layoutFactory } from '@utils/topology/utils/factory';
import { saveNodePositions } from '@utils/topology/utils/position';
import NodeTopology from './components/NodeTopology/NodeTopology';

import './components/NodeTopology/NodeTopology.scss';

type NodeTopologyProps = {
  obj: IoK8sApiCoreV1Node;
};

const NodeTopologyPage: FC<NodeTopologyProps> = ({ obj }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const pathnameRef = useRef(location.pathname);

  useEffect(() => {
    pathnameRef.current = location.pathname;
  }, [location.pathname]);

  const controller = useMemo(() => {
    const visualization = new Visualization();
    visualization.registerLayoutFactory(layoutFactory);
    visualization.registerComponentFactory(componentFactory);

    visualization.addEventListener(SELECTION_EVENT, (id) => {
      const newParams = new URLSearchParams(id?.[0] ? { [SELECTED_ID_QUERY_PARAM]: id[0] } : {});
      navigate({ pathname: pathnameRef.current, search: newParams.toString() });
    });

    visualization.addEventListener(NODE_POSITIONING_EVENT, () => saveNodePositions(visualization));
    visualization.addEventListener(GRAPH_POSITIONING_EVENT, () => saveNodePositions(visualization));
    visualization.setFitToScreenOnLayout(true);
    visualization.fromModel({
      graph: {
        id: 'nns-topology',
        type: ModelKind.graph,
        layout: 'Levels',
      },
    });
    return visualization;
    // No dependencies, we only want this to initialize once
  }, []);

  return (
    <Flex
      className="nmstate-node-topology"
      direction={{ default: 'column', md: 'row' }}
      flexWrap={{ default: 'nowrap' }}
    >
      <FlexItem flex={{ default: 'flex_1' }} className="nmstate-node-topology__topology">
        <VisualizationProvider controller={controller}>
          <NodeTopology obj={obj} />
        </VisualizationProvider>
      </FlexItem>
      <FlexItem className="nmstate-node-topology__policies-panel-wrap pf-v6-u-h-100-on-md">
        <NodeNetworkingPoliciesPanel node={obj} />
      </FlexItem>
    </Flex>
  );
};

export default NodeTopologyPage;
