import React, { FC, useEffect, useMemo, useState } from 'react';

import {
  NodeNetworkConfigurationEnactmentModelGroupVersionKind,
  NodeNetworkStateModelGroupVersionKind,
} from '@models';
import { ListPageBody, useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';
import {
  action,
  createTopologyControlButtons,
  defaultControlButtonsOptions,
  SELECTION_EVENT,
  TopologyControlBar,
  TopologyView,
  Visualization,
  VisualizationProvider,
  VisualizationSurface,
} from '@patternfly/react-topology';
import { V1beta1NodeNetworkConfigurationEnactment, V1beta1NodeNetworkState } from '@types';
import AccessDenied from '@utils/components/AccessDenied/AccessDenied';
import { categorizeEnactments } from '@utils/enactments/utils';
import { isEmpty } from '@utils/helpers';

import TopologySidebar from './components/TopologySidebar/TopologySidebar';
import TopologyToolbar from './components/TopologyToolbar/TopologyToolbar';
import { GRAPH_POSITIONING_EVENT, NODE_POSITIONING_EVENT } from './utils/constants';
import { componentFactory, layoutFactory } from './utils/factory';
import { restoreNodePositions, saveNodePositions } from './utils/position';
import { transformDataToTopologyModel } from './utils/utils';

const Topology: FC = () => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [visualization, setVisualization] = useState<Visualization>(null);
  const [selectedNodeFilters, setSelectedNodeFilters] = useState<string[]>([]);

  const [states, statesLoaded, statesError] = useK8sWatchResource<V1beta1NodeNetworkState[]>({
    groupVersionKind: NodeNetworkStateModelGroupVersionKind,
    isList: true,
    namespaced: false,
  });

  const [enhancments] = useK8sWatchResource<V1beta1NodeNetworkConfigurationEnactment[]>({
    groupVersionKind: NodeNetworkConfigurationEnactmentModelGroupVersionKind,
    isList: true,
    namespaced: false,
  });

  const { available } = categorizeEnactments(enhancments);

  const nodeNames: string[] = useMemo(
    () => states?.map((state) => state.metadata.name) || [],
    [states],
  );

  useEffect(() => {
    if (!statesLoaded || statesError || isEmpty(states)) return;

    const filteredStates = !isEmpty(selectedNodeFilters)
      ? states.filter((state) => selectedNodeFilters.includes(state.metadata.name))
      : undefined;

    const topologyModel = transformDataToTopologyModel(states, filteredStates, available);

    if (!visualization) {
      const newVisualization = new Visualization();
      newVisualization.registerLayoutFactory(layoutFactory);
      newVisualization.registerComponentFactory(componentFactory);
      newVisualization.addEventListener(SELECTION_EVENT, setSelectedIds);
      newVisualization.addEventListener(NODE_POSITIONING_EVENT, () =>
        saveNodePositions(newVisualization),
      );
      newVisualization.addEventListener(GRAPH_POSITIONING_EVENT, () =>
        saveNodePositions(newVisualization),
      );
      newVisualization.setFitToScreenOnLayout(true);
      newVisualization.fromModel(topologyModel, false);
      restoreNodePositions(newVisualization);
      setVisualization(newVisualization);
      return;
    }

    visualization.fromModel(topologyModel);
  }, [states, statesLoaded, statesError, selectedNodeFilters]);

  if (statesError && statesError?.response?.status === 403)
    return (
      <ListPageBody>
        <AccessDenied message={statesError.message} />
      </ListPageBody>
    );

  return (
    <VisualizationProvider controller={visualization}>
      <TopologyView
        sideBar={
          <TopologySidebar
            states={states}
            selectedIds={selectedIds}
            setSelectedIds={setSelectedIds}
          />
        }
        viewToolbar={
          <TopologyToolbar
            nodeNames={nodeNames}
            selectedNodeFilters={selectedNodeFilters}
            setSelectedNodeFilters={setSelectedNodeFilters}
          />
        }
        controlBar={
          <TopologyControlBar
            controlButtons={createTopologyControlButtons({
              ...defaultControlButtonsOptions,
              zoomInCallback: action(() => {
                const scale = visualization.getGraph().getScale();
                visualization.getGraph().setScale(scale * 1.1);
              }),
              zoomOutCallback: action(() => {
                const scale = visualization.getGraph().getScale();
                visualization.getGraph().setScale(scale * 0.9);
              }),
              fitToScreenCallback: action(() => {
                visualization.getGraph().fit(40);
              }),
              resetViewCallback: action(() => {
                visualization.getGraph().reset();
                visualization.getGraph().layout();
              }),
              legend: false,
            })}
          />
        }
      >
        <VisualizationSurface state={{ selectedIds }} />
      </TopologyView>
    </VisualizationProvider>
  );
};

export default Topology;
