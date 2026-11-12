import React from 'react';
import { http, HttpResponse } from 'msw';
import { consoleApiPath, findByMetadataName } from 'src/__mocks__/integration/api';
import { RouterProvider } from 'src/__mocks__/integration/react-router';
import recordedNncps from 'src/__mocks__/integration/recordings/nncps.json' with { type: 'json' };
import { server } from 'src/__mocks__/integration/server';

import { describe, expect, it, jest } from '@jest/globals';
import type { V1NodeNetworkConfigurationPolicy } from '@kubevirt-ui-ext/kubevirt-api/nmstate';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import EditModal from './EditModal';

const POLICY = findByMetadataName(
  recordedNncps.items,
  'pw-int-fixture',
) as unknown as V1NodeNetworkConfigurationPolicy;
const POLICY_PATH = `${consoleApiPath('nmstate.io', 'v1', 'nodenetworkconfigurationpolicies')}/${POLICY.metadata.name}`;

describe('EditModal over the recorded policy', () => {
  it('saves the edited policy as a PUT with the edited description', async () => {
    let updated: V1NodeNetworkConfigurationPolicy | undefined;
    server.use(
      http.put(POLICY_PATH, async ({ request }) => {
        updated = (await request.json()) as V1NodeNetworkConfigurationPolicy;
        return HttpResponse.json(updated);
      }),
    );

    const closeModal = jest.fn();
    render(
      <RouterProvider>
        <EditModal closeModal={closeModal} isOpen policy={POLICY} />
      </RouterProvider>,
    );

    expect(await screen.findByText('Edit NodeNetworkConfigurationPolicy')).toBeTruthy();

    const description = document.querySelector<HTMLInputElement>('#policy-description');
    fireEvent.change(description, { target: { value: 'edited description' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() => expect(updated).toBeDefined());
    expect(updated?.metadata.annotations?.description).toBe('edited description');
    expect(updated?.spec.desiredState.interfaces[0].name).toBe('dummy0');
    expect(closeModal).toHaveBeenCalled();
  });
});
