import { ThSortType } from '@patternfly/react-table/dist/esm/components/Table/base/types';

export type PhysicalNetworkColumn = {
  id: string;
  sort: (columnIndex: number) => ThSortType;
  title: string;
};
