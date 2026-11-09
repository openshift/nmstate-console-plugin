import React, { useState } from 'react';
import { produce } from 'immer';
import { settle } from 'src/__mocks__/integration/act';
import { findByMetadataName } from 'src/__mocks__/integration/api';
import { RouterProvider } from 'src/__mocks__/integration/react-router';
import recordedNncps from 'src/__mocks__/integration/recordings/nncps.json' with { type: 'json' };

import { describe, expect, it } from '@jest/globals';
import type { V1NodeNetworkConfigurationPolicy } from '@kubevirt-ui-ext/kubevirt-api/nmstate';
import { fireEvent, render, screen } from '@testing-library/react';

import PolicyForm from './PolicyForm';

const BASE_POLICY = JSON.parse(
  JSON.stringify(findByMetadataName(recordedNncps.items, 'pw-int-fixture')),
) as V1NodeNetworkConfigurationPolicy;

const Harness = ({ createForm = false }: { createForm?: boolean }) => {
  const [policy, setPolicy] = useState<V1NodeNetworkConfigurationPolicy>(BASE_POLICY);
  const update = (recipe: Parameters<typeof produce>[1]) =>
    setPolicy((current) => produce(current, recipe));

  return (
    <RouterProvider>
      <PolicyForm createForm={createForm} formId="test-form" policy={policy} setPolicy={update} />
      <pre data-testid="draft">{JSON.stringify(policy)}</pre>
    </RouterProvider>
  );
};

const draft = (): V1NodeNetworkConfigurationPolicy =>
  JSON.parse(screen.getByTestId('draft').textContent) as V1NodeNetworkConfigurationPolicy;

describe('PolicyForm over the recorded policy', () => {
  it('writes the edited description into the policy annotations', async () => {
    render(<Harness />);
    await settle();

    fireEvent.change(document.querySelector<HTMLInputElement>('#policy-description'), {
      target: { value: 'uplinks for the lab' },
    });

    expect(draft().metadata.annotations?.description).toBe('uplinks for the lab');
  });

  it('prepends a linux bridge interface when adding another interface', async () => {
    render(<Harness />);
    await settle();
    const initialCount = BASE_POLICY.spec.desiredState.interfaces.length;

    fireEvent.click(
      await screen.findByRole('button', { name: /Add another interface to the policy/ }),
    );

    const interfaces = draft().spec.desiredState.interfaces;
    expect(interfaces).toHaveLength(initialCount + 1);
    expect(interfaces[0]).toMatchObject({
      name: `interface-${initialCount}`,
      state: 'up',
      type: 'linux-bridge',
    });
  });

  it('removes the node selector when the apply-selector checkbox is cleared', async () => {
    render(<Harness createForm />);
    await settle();
    expect(draft().spec.nodeSelector).toBeDefined();

    fireEvent.click(document.querySelector('#apply-nncp-selector'));

    expect(draft().spec.nodeSelector).toBeUndefined();
  });
});
