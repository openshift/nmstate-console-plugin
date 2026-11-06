import { dump } from 'js-yaml';

import {
  NodeNetworkConfigurationInterface,
  NodeNetworkConfigurationInterfaceLLDPNeighbor,
} from '@kubevirt-ui-ext/kubevirt-api/nmstate';
import { getChassisId, getPortId } from '@utils/resources/neighbors/getters';

export const copyToClipboard = (selectedInterface: NodeNetworkConfigurationInterface) => {
  const el = document.createElement('textarea');
  el.value = dump(selectedInterface);
  document.body.appendChild(el);
  el.select();
  document.execCommand('copy');
  document.body.removeChild(el);
};

export const downloadYAML = (selectedInterface: NodeNetworkConfigurationInterface) => {
  const el = document.createElement('a');
  el.setAttribute(
    'href',
    `data:text/plain;charset=utf-8,${encodeURIComponent(dump(selectedInterface))}`,
  );
  el.setAttribute('download', 'interface.yaml');
  el.style.display = 'none';
  document.body.appendChild(el);
  el.click();
  document.body.removeChild(el);
};

export const getNeighborKey = (
  neighbor: NodeNetworkConfigurationInterfaceLLDPNeighbor,
  index: number,
): string => {
  // LLDP identity is the chassis-id/port-id pair; identical advertisements can repeat,
  // so the position disambiguates them without relying on a non-unique property.
  return `${getChassisId(neighbor)}-${getPortId(neighbor)}-${index}`;
};
