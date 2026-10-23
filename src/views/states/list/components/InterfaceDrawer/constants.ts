import { FC } from 'react';

import { NodeNetworkConfigurationInterface } from '@kubevirt-ui-ext/kubevirt-api/nmstate';

export type InterfaceDrawerTabId = 'drawer-details' | 'drawer-yaml';

export type InterfaceDrawerTabProps = {
  id: InterfaceDrawerTabId;
  title: string;
  component: FC<{ selectedInterface: NodeNetworkConfigurationInterface }>;
};
