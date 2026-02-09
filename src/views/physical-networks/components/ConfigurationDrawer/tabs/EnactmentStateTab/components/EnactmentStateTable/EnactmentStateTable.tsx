import React, { FC } from 'react';

import { useNMStateTranslation } from '@utils/hooks/useNMStateTranslation';
import { DataViewTable } from '@patternfly/react-data-view';

import { NodeEnactmentStateDetails } from '../../../../../../utils/types';

import { getEnactmentStateRows, getEnactmentStateTableColumns } from './utils/utils';

type EnactmentStateTableProps = {
  nodeEnactmentStateDetails: NodeEnactmentStateDetails[];
};

const EnactmentStateTable: FC<EnactmentStateTableProps> = ({ nodeEnactmentStateDetails }) => {
  const { t } = useNMStateTranslation();

  return (
    <DataViewTable
      aria-label={t('Enactment state table')}
      columns={getEnactmentStateTableColumns(t)}
      rows={getEnactmentStateRows(nodeEnactmentStateDetails)}
    />
  );
};

export default EnactmentStateTable;
