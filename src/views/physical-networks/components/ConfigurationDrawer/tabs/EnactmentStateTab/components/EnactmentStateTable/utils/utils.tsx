import React from 'react';
import { TFunction } from 'react-i18next';
import { Link } from 'react-router-dom-v5-compat';

import { ResourceIcon } from '@openshift-console/dynamic-plugin-sdk';
import { DataViewTh, DataViewTr } from '@patternfly/react-data-view/dist/esm/DataViewTable';
import { getName } from '@utils/components/resources/selectors';
import { getResourceUrl } from '@utils/helpers';

import { modelToGroupVersionKind } from '../../../../../../../../../console-models/modelUtils';
import NodeModel from '../../../../../../../../../console-models/NodeModel';
import { NodeEnactmentStateDetails } from '../../../../../../../utils/types';
import EnactmentStateWithIcon from '../../../../../../EnactmentStateWithIcon';

export const getEnactmentStateRows = (
  nodeEnactmentStateDetails: NodeEnactmentStateDetails[],
): DataViewTr[] =>
  nodeEnactmentStateDetails.map(({ node, status }) => {
    return [
      {
        cell: (
          <>
            <ResourceIcon groupVersionKind={modelToGroupVersionKind(NodeModel)} />
            <Link to={getResourceUrl({ model: NodeModel, resource: node })}>{getName(node)}</Link>
          </>
        ),
      },
      {
        cell: <EnactmentStateWithIcon status={status} />,
      },
    ];
  });

export const getEnactmentStateTableColumns = (t: TFunction): DataViewTh[] => [
  { cell: t('Nodes'), key: 'node.metadata.name', props: { sort: { columnIndex: 0, sortBy: {} } } },
  { cell: t('State'), key: 'status', props: { sort: { columnIndex: 1, sortBy: {} } } },
];
