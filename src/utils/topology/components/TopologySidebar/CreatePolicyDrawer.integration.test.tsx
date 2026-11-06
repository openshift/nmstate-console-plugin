import React from 'react';
import { http, HttpResponse } from 'msw';
import { consoleApiPath, mockList } from 'src/__mocks__/integration/api';
import { RouterProvider } from 'src/__mocks__/integration/react-router';
import recordedNns from 'src/__mocks__/integration/recordings/nns.json';
import recordedNodes from 'src/__mocks__/integration/recordings/nodes.json';
import { server } from 'src/__mocks__/integration/server';

import { describe, expect, it, jest } from '@jest/globals';
import type { V1NodeNetworkConfigurationPolicy } from '@kubevirt-ui-ext/kubevirt-api/nmstate';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import CreatePolicyDrawer from './CreatePolicyDrawer';

const POLICIES = consoleApiPath('nmstate.io', 'v1', 'nodenetworkconfigurationpolicies');
const NODES = consoleApiPath('', 'v1', 'nodes');
const NNS = consoleApiPath('nmstate.io', 'v1beta1', 'nodenetworkstates');

const renderDrawer = () =>
  render(
    <RouterProvider>
      <CreatePolicyDrawer resetPolicyWizard={jest.fn()} />
    </RouterProvider>,
  );

const nextButton = () => screen.getByRole('button', { name: 'Next' });

describe('CreatePolicyDrawer', () => {
  it('walks the wizard and creates the policy with the entered physical network name', async () => {
    mockList(NODES, recordedNodes.items);
    mockList(NNS, recordedNns.items);

    let created: V1NodeNetworkConfigurationPolicy | undefined;
    server.use(
      http.post(POLICIES, async ({ request }) => {
        created = (await request.json()) as V1NodeNetworkConfigurationPolicy;
        return HttpResponse.json(created);
      }),
    );

    renderDrawer();

    // Network identity: the step is blocked until the physical network name is set.
    await waitFor(() =>
      expect(document.querySelector<HTMLInputElement>('#physical-network-name')).toBeTruthy(),
    );
    expect(nextButton().hasAttribute('disabled')).toBe(true);
    fireEvent.change(document.querySelector<HTMLInputElement>('#physical-network-name'), {
      target: { value: 'physnet-lab' },
    });
    fireEvent.click(nextButton());

    // Nodes configuration.
    await waitFor(() => expect(document.querySelector('#policy-name')).toBeTruthy());
    fireEvent.change(document.querySelector<HTMLInputElement>('#policy-description'), {
      target: { value: 'created by the integration test' },
    });
    fireEvent.click(nextButton());

    // Uplink connection: br-ex is the default, so the settings step is skipped.
    await waitFor(() =>
      expect(document.querySelector('#uplink-connection-radio-brex')).toBeTruthy(),
    );
    fireEvent.click(nextButton());

    // Review and create.
    await waitFor(() =>
      expect(document.querySelector('[data-test-id="review-physical-network-name"]')).toBeTruthy(),
    );
    expect(
      document.querySelector('[data-test-id="review-physical-network-name"]').textContent,
    ).toContain('physnet-lab');

    fireEvent.click(screen.getByRole('button', { name: 'Create network' }));

    await waitFor(() => expect(created).toBeDefined());
    expect(created.metadata.name).toMatch(/^policy-/);
    expect(created.metadata.annotations?.description).toBe('created by the integration test');
    expect(created.spec.desiredState.ovn['bridge-mappings'][0]).toMatchObject({
      bridge: 'br-ex',
      localnet: 'physnet-lab',
    });
  });
});
