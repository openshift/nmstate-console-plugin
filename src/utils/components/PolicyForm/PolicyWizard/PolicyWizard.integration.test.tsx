import React, { useState } from 'react';
import { produce } from 'immer';
import { RouterProvider } from 'src/__mocks__/integration/react-router';
import recordedUplinkPolicy from 'src/__mocks__/integration/recordings/policy-uplink.json';

import { describe, expect, it, jest } from '@jest/globals';
import type { V1NodeNetworkConfigurationPolicy } from '@kubevirt-ui-ext/kubevirt-api/nmstate';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import PolicyWizard from './PolicyWizard';

const WIZARD_POLICY = recordedUplinkPolicy as unknown as V1NodeNetworkConfigurationPolicy;

const Harness = ({ onSubmit }: { onSubmit: () => void }) => {
  const [policy, setPolicy] = useState<V1NodeNetworkConfigurationPolicy>(WIZARD_POLICY);
  const [createAnother, setCreateAnother] = useState(false);
  const update = (recipe: Parameters<typeof produce>[1]) =>
    setPolicy((current) => produce(current, recipe));

  return (
    <RouterProvider>
      <PolicyWizard
        createAnotherPolicyState={[createAnother, setCreateAnother]}
        onClose={jest.fn()}
        onSubmit={onSubmit}
        policy={policy}
        setPolicy={update}
      />
    </RouterProvider>
  );
};

describe('PolicyWizard', () => {
  it('blocks the first step until the physical network name is set', async () => {
    render(<Harness onSubmit={jest.fn()} />);

    const nextButton = await screen.findByRole('button', { name: 'Next' });
    expect(nextButton.hasAttribute('disabled')).toBe(true);

    fireEvent.change(document.querySelector<HTMLInputElement>('#physical-network-name'), {
      target: { value: 'physnet-lab' },
    });

    await waitFor(() => expect(nextButton.hasAttribute('disabled')).toBe(false));
  });

  it('advances to the nodes configuration step', async () => {
    render(<Harness onSubmit={jest.fn()} />);

    await waitFor(() =>
      expect(document.querySelector<HTMLInputElement>('#physical-network-name')).toBeTruthy(),
    );
    fireEvent.change(document.querySelector<HTMLInputElement>('#physical-network-name'), {
      target: { value: 'physnet-lab' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Next' }));

    await waitFor(() => expect(document.querySelector('#policy-name')).toBeTruthy());
    expect((document.querySelector('#policy-name') as HTMLInputElement).value).toBe(
      'pw-int-uplink',
    );
  });

  it('blocks the uplink step until the selected single-interface uplink is valid', async () => {
    render(<Harness onSubmit={jest.fn()} />);

    const physicalNetworkName = await waitFor(() => {
      const input = document.querySelector<HTMLInputElement>('#physical-network-name');
      if (!input) {
        throw new Error('The physical network name field did not render');
      }
      return input;
    });
    fireEvent.change(physicalNetworkName, { target: { value: 'physnet-lab' } });
    fireEvent.click(screen.getByRole('button', { name: 'Next' }));

    await waitFor(() => expect(document.querySelector('#policy-name')).toBeTruthy());
    fireEvent.click(screen.getByRole('button', { name: 'Next' }));

    fireEvent.click(await screen.findByRole('radio', { name: /A single interface/ }));

    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Next' }).hasAttribute('disabled')).toBe(true),
    );
  });
});
