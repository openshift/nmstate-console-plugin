import React from 'react';

import {
  InterfaceType,
  NodeNetworkConfigurationInterface,
} from '@kubevirt-ui/kubevirt-api/nmstate';
import { cleanup, render } from '@testing-library/react';

import { NETWORK_STATES } from '../constants';
import PolicyInterface from '../PolicyInterface';

afterEach(cleanup);

const policyInterface: NodeNetworkConfigurationInterface = {
  name: 'br0',
  type: InterfaceType.LINUX_BRIDGE,
  state: NETWORK_STATES.Up,
};

const onInterfaceChange = jest.fn();

test('NNCPInterface', async () => {
  const { getByLabelText } = render(
    <PolicyInterface
      id={1}
      policyInterface={policyInterface}
      onInterfaceChange={onInterfaceChange}
    />,
  );

  expect((getByLabelText('Interface name', { exact: false }) as HTMLInputElement).value).toBe(
    policyInterface.name,
  );
});
