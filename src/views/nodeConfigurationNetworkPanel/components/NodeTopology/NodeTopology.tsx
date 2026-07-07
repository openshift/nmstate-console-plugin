import React, { FC, useEffect, useMemo, useRef } from 'react';

import { IoK8sApiCoreV1Node } from '@kubevirt-ui/kubevirt-api/kubernetes/models';
import {
  V1beta1NodeNetworkConfigurationEnactment,
  V1beta1NodeNetworkState,
} from '@kubevirt-ui/kubevirt-api/nmstate';
import {
  NodeNetworkConfigurationEnactmentModelGroupVersionKind,
  NodeNetworkStateModelGroupVersionKind,
} from '@models';
import {
  ListPageBody,
  ListPageHeader,
  useK8sWatchResource,
} from '@openshift-console/dynamic-plugin-sdk';
import { Popover } from '@patternfly/react-core';
import {
  TopologyView,
  useVisualizationController,
  VisualizationSurface,
} from '@patternfly/react-topology';
import AccessDenied from '@utils/components/AccessDenied/AccessDenied';
import { getName } from '@utils/components/resources/selectors';
import { FORBIDDEN_STATUS } from '@utils/constants';
import { isEmpty } from '@utils/helpers';
import { useNMStateTranslation } from '@utils/hooks/useNMStateTranslation';
import useQueryParams from '@utils/hooks/useQueryParams';
import { categorizeEnactments } from '@utils/resources/enactments/utils';
import ControlBar from '@utils/topology/components/TopologyControlBar/TopologyControlBar';
import TopologyLegend from '@utils/topology/components/TopologyLegend/TopologyLegend';
import { restoreNodePositions } from '@utils/topology/utils/position';
import { getCorrelatedEnactment, transformDataToTopologyModel } from '@utils/topology/utils/utils';

import NodeTopologySidebar from '../NodeTopologySidebar/NodeTopologySidebar';
import NodeTopologyToolbar from '../NodeTopologyToolbar/NodeTopologyToolbar';

import './NodeTopology.scss';

type NodeTopologyProps = {
  obj: IoK8sApiCoreV1Node;
};

const NodeTopology: FC<NodeTopologyProps> = ({ obj }) => {
  const { t } = useNMStateTranslation();
  const controller = useVisualizationController();
  const nodeNameRef = useRef<string>();
  const nodeName = getName(obj);

  const queryParams = useQueryParams();

  const [state, stateLoaded, stateError] = useK8sWatchResource<V1beta1NodeNetworkState>({
    groupVersionKind: NodeNetworkStateModelGroupVersionKind,
    isList: false,
    name: nodeName,
    namespaced: false,
  });

  const [enactments, enactmentsLoaded, enactmentsError] = useK8sWatchResource<
    V1beta1NodeNetworkConfigurationEnactment[]
  >({
    groupVersionKind: NodeNetworkConfigurationEnactmentModelGroupVersionKind,
    isList: true,
    namespaced: false,
  });

  const availableEnactments = useMemo(() => {
    if (!enactmentsLoaded || enactmentsError || isEmpty(enactments)) {
      return [];
    }
    const nodeEnactments = getCorrelatedEnactment(enactments, nodeName);
    if (!nodeEnactments) {
      return [];
    }
    const { available } = categorizeEnactments(nodeEnactments ? [nodeEnactments] : []);
    return available;
  }, [enactments, enactmentsLoaded, enactmentsError, nodeName]);

  useEffect(() => {
    if (!controller || !stateLoaded || stateError || !state) {
      return;
    }

    const topologyModel = transformDataToTopologyModel(
      [state],
      [state],
      availableEnactments,
      null,
      [nodeName],
    );

    controller.fromModel(topologyModel, true);

    if (nodeNameRef.current !== nodeName) {
      nodeNameRef.current = nodeName;
      restoreNodePositions(controller);
      controller.getGraph().fit(40);
    }
  }, [controller, state, stateLoaded, stateError, availableEnactments, nodeName]);

  if (stateError?.response?.status === FORBIDDEN_STATUS)
    return (
      <>
        <ListPageHeader title={t('Node network configuration')} />
        <ListPageBody>
          <AccessDenied message={stateError.message} />
        </ListPageBody>
      </>
    );

  return (
    <TopologyView
      className="nmstate-node-topology"
      sideBar={stateLoaded && <NodeTopologySidebar states={state ? [state] : []} />}
      viewToolbar={<NodeTopologyToolbar />}
      controlBar={<ControlBar controller={controller} />}
    >
      <VisualizationSurface state={queryParams} />
      <Popover
        aria-label={t('Node network configuration graph legend')}
        bodyContent={<TopologyLegend />}
        hasAutoWidth
        triggerRef={() => document.getElementById('legend') as HTMLButtonElement}
      />
    </TopologyView>
  );
};

export default NodeTopology;
