import { NodeNetworkConfigurationInterfaceLLDPNeighbor } from '@kubevirt-ui-ext/kubevirt-api/nmstate';

import { getNeighborKey } from './utils';

const neighbor = [
  { 'chassis-id': '08:05:E2:7D:0A:20', type: 1 },
  { 'port-id': 'xe-0/0/19', type: 2 },
] as NodeNetworkConfigurationInterfaceLLDPNeighbor;

describe('getNeighborKey', () => {
  it('disambiguates identical advertisements by position', () => {
    expect(getNeighborKey(neighbor, 0)).not.toBe(getNeighborKey(neighbor, 1));
  });

  it('distinguishes different neighbors at the same position', () => {
    const otherNeighbor = [
      { 'chassis-id': '08:05:E2:7D:0A:21', type: 1 },
      { 'port-id': 'xe-0/0/20', type: 2 },
    ] as NodeNetworkConfigurationInterfaceLLDPNeighbor;

    expect(getNeighborKey(neighbor, 0)).not.toBe(getNeighborKey(otherNeighbor, 0));
  });
});
