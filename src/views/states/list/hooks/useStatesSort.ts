import React, { useMemo } from 'react';

import { V1beta1NodeNetworkState } from '@kubevirt-ui/kubevirt-api/nmstate';
import { useDataViewSort } from '@patternfly/react-data-view';
import { SortByDirection, ThSortType } from '@patternfly/react-table';
import { getName } from '@utils/components/resources/selectors';

import { COLUMN_NAME_ID } from './useStateColumns';

type UseStatesSortResult = {
  sortedStates: V1beta1NodeNetworkState[];
  nameSortParams: ThSortType;
};

const useStatesSort = (data: V1beta1NodeNetworkState[]): UseStatesSortResult => {
  const { onSort, sortBy, direction } = useDataViewSort();

  const sortedStates = useMemo(() => {
    const items = [...data];
    if (!sortBy) return items;
    return items.sort((a, b) => {
      const aName = getName(a) ?? '';
      const bName = getName(b) ?? '';
      return direction === 'asc' ? aName.localeCompare(bName) : bName.localeCompare(aName);
    });
  }, [data, sortBy, direction]);

  const nameSortParams: ThSortType = {
    sortBy: { index: sortBy === COLUMN_NAME_ID ? 1 : null, direction },
    onSort: (_event: React.MouseEvent, _index: number, dir: SortByDirection) => {
      onSort(undefined, COLUMN_NAME_ID, dir);
    },
    columnIndex: 1,
  };

  return { sortedStates, nameSortParams };
};

export default useStatesSort;
