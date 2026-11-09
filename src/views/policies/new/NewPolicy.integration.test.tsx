import React from 'react';
import { http, HttpResponse } from 'msw';
import { consoleApiPath, mockList } from 'src/__mocks__/integration/api';
import { RouterProvider } from 'src/__mocks__/integration/react-router';
import recordedNodes from 'src/__mocks__/integration/recordings/nodes.json' with { type: 'json' };
import { server } from 'src/__mocks__/integration/server';

import { describe, expect, it } from '@jest/globals';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import NewPolicy from './NewPolicy';

const POLICIES = consoleApiPath('nmstate.io', 'v1', 'nodenetworkconfigurationpolicies');
const NODES = consoleApiPath('', 'v1', 'nodes');

type CreatedPolicy = {
  metadata: { name: string };
  spec: { desiredState: { interfaces: { name: string; state: string; type: string }[] } };
};

describe('NewPolicy over the mocked console API', () => {
  it('submits the form as a create request with the edited policy', async () => {
    mockList(NODES, recordedNodes.items);
    mockList(POLICIES, []);

    let created: CreatedPolicy | undefined;
    server.use(
      http.post(POLICIES, async ({ request }) => {
        created = (await request.json()) as CreatedPolicy;
        return HttpResponse.json(created, { status: 201 });
      }),
    );

    render(
      <RouterProvider>
        <NewPolicy />
      </RouterProvider>,
    );

    expect(await screen.findByText('Create NodeNetworkConfigurationPolicy')).toBeTruthy();

    fireEvent.change(await screen.findByDisplayValue('policy-name'), {
      target: { value: 'pw-int-form' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Create' }));

    await waitFor(() => expect(created).toBeDefined());
    expect(created?.metadata.name).toBe('pw-int-form');
    expect(created?.spec.desiredState.interfaces[0]).toMatchObject({
      name: 'br0',
      state: 'up',
      type: 'linux-bridge',
    });
  });
});
