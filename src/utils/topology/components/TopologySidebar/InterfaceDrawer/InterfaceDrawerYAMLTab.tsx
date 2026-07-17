import React, { FC } from 'react';
import { dump } from 'js-yaml';

import { NodeNetworkConfigurationInterface } from '@kubevirt-ui/kubevirt-api/nmstate';

type InterfaceDrawerYAMLTabProps = {
  selectedInterface: NodeNetworkConfigurationInterface;
};

const InterfaceDrawerYAMLTab: FC<InterfaceDrawerYAMLTabProps> = ({ selectedInterface }) => (
  <pre>{dump(selectedInterface)}</pre>
);

export default InterfaceDrawerYAMLTab;
