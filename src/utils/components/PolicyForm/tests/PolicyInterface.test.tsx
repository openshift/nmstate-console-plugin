import React from 'react';

import { cleanup, render } from '@testing-library/react';
import { InterfaceType, NodeNetworkConfigurationInterface } from '@types';

import PolicyInterface from '../PolicyInterface';
import { NETWORK_STATES } from '../utils/constants';

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
