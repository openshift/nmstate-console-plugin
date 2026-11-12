import React from 'react';
import { http, HttpResponse } from 'msw';
import { consoleApiPath, findByMetadataName } from 'src/__mocks__/integration/api';
import { RouterProvider } from 'src/__mocks__/integration/react-router';
import recordedNncps from 'src/__mocks__/integration/recordings/nncps.json' with { type: 'json' };
import { server } from 'src/__mocks__/integration/server';

import { describe, expect, it, jest } from '@jest/globals';
import type { V1NodeNetworkConfigurationPolicy } from '@kubevirt-ui-ext/kubevirt-api/nmstate';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import DeleteModal from './DeleteModal';

const POLICY = findByMetadataName(
  recordedNncps.items,
  'pw-int-fixture',
) as unknown as V1NodeNetworkConfigurationPolicy;
const POLICY_PATH = `${consoleApiPath('nmstate.io', 'v1', 'nodenetworkconfigurationpolicies')}/${POLICY.metadata.name}`;

const renderModal = (closeModal: () => void) =>
  render(
    <RouterProvider>
      <DeleteModal closeModal={closeModal} isOpen policy={POLICY} />
    </RouterProvider>,
  );

describe('DeleteModal over the recorded policy', () => {
  it('keeps the confirmation button disabled until the name matches', async () => {
    renderModal(jest.fn());

    const deleteButton = await screen.findByRole('button', { name: 'Delete' });
    expect(deleteButton.hasAttribute('disabled')).toBe(true);

    fireEvent.change(screen.getByLabelText('Enter name'), { target: { value: 'wrong' } });
    expect(deleteButton.hasAttribute('disabled')).toBe(true);
  });

  it('deletes the policy through the console proxy once confirmed', async () => {
    let requestedPath: string | undefined;
    server.use(
      http.delete(POLICY_PATH, ({ request }) => {
        requestedPath = new URL(request.url).pathname;
        return HttpResponse.json({ kind: 'Status', status: 'Success' });
      }),
    );

    const closeModal = jest.fn();
    renderModal(closeModal);

    fireEvent.change(await screen.findByLabelText('Enter name'), {
      target: { value: POLICY.metadata.name },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Delete' }));

    await waitFor(() =>
      expect(requestedPath).toBe(
        `/api/kubernetes/apis/nmstate.io/v1/nodenetworkconfigurationpolicies/${POLICY.metadata.name}`,
      ),
    );
    expect(closeModal).toHaveBeenCalled();
  });
});
