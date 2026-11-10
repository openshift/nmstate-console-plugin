import React from 'react';

import { NodeNetworkConfigurationInterface } from '@kubevirt-ui-ext/kubevirt-api/nmstate';
import { fireEvent, render, screen } from '@testing-library/react';

import IPConfiguration from './IPConfiguration';

describe('IPConfiguration prefix length', () => {
  it('ignores prefix updates when the address entry or the value is missing', () => {
    const onInterfaceChange = jest.fn();
    render(
      <IPConfiguration
        id={1}
        onInterfaceChange={onInterfaceChange}
        policyInterface={
          { ipv4: { enabled: true, address: [] } } as unknown as NodeNetworkConfigurationInterface
        }
      />,
    );

    screen.getAllByRole('button').forEach((button) => fireEvent.click(button));
    fireEvent.change(screen.getByRole('spinbutton'), { target: { value: '' } });

    expect(onInterfaceChange).not.toHaveBeenCalled();
  });
});
