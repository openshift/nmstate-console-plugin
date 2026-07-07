jest.mock('@patternfly/react-topology', () => ({
  EdgeModel: {},
  Model: {},
  ModelKind: { graph: 'graph' },
  NodeModel: {},
  NodeShape: {},
  NodeStatus: {},
}));

jest.mock('@utils/topology/components/BridgeIcon', () => ({
  __esModule: true,
  default: () => null,
}));

import { V1beta1NodeNetworkConfigurationEnactment } from '@kubevirt-ui/kubevirt-api/nmstate';

import { getCorrelatedEnactment } from './utils';

describe('getCorrelatedEnactment', () => {
  const nodeName = 'worker-0';

  it('returns enactment whose owner reference matches the node name', () => {
    const matchingEnactment = {
      metadata: {
        name: 'worker-0-enactment',
        ownerReferences: [{ name: nodeName }],
      },
    } as V1beta1NodeNetworkConfigurationEnactment;

    const otherEnactment = {
      metadata: {
        name: 'worker-1-enactment',
        ownerReferences: [{ name: 'worker-1' }],
      },
    } as V1beta1NodeNetworkConfigurationEnactment;

    expect(getCorrelatedEnactment([otherEnactment, matchingEnactment], nodeName)).toBe(
      matchingEnactment,
    );
  });

  it('returns undefined when no enactment matches the node name', () => {
    const enactment = {
      metadata: {
        name: 'worker-1-enactment',
        ownerReferences: [{ name: 'worker-1' }],
      },
    } as V1beta1NodeNetworkConfigurationEnactment;

    expect(getCorrelatedEnactment([enactment], nodeName)).toBeUndefined();
  });

  it('returns undefined for an empty enactments list', () => {
    expect(getCorrelatedEnactment([], nodeName)).toBeUndefined();
  });
});
