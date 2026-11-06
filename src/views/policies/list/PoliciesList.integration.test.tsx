import React from 'react';
import { consoleApiPath, findByMetadataName, mockList } from 'src/__mocks__/integration/api';
import { LocationProbe, RouterProvider, useLocation } from 'src/__mocks__/integration/react-router';
import recordedNnces from 'src/__mocks__/integration/recordings/nnces.json';
import recordedNncps from 'src/__mocks__/integration/recordings/nncps.json';
import recordedNodes from 'src/__mocks__/integration/recordings/nodes.json';
import { server } from 'src/__mocks__/integration/server';
import PolicyDetailsPage from 'src/views/policies/details/PolicyDetailsPage';

import { describe, expect, it } from '@jest/globals';
import type {
  V1beta1NodeNetworkConfigurationEnactment,
  V1NodeNetworkConfigurationPolicy,
} from '@kubevirt-ui-ext/kubevirt-api/nmstate';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';

import PoliciesList from './PoliciesList';

const POLICIES = consoleApiPath('nmstate.io', 'v1', 'nodenetworkconfigurationpolicies');
const ENACTMENTS = consoleApiPath('nmstate.io', 'v1beta1', 'nodenetworkconfigurationenactments');
const NODES = consoleApiPath('', 'v1', 'nodes');

const POLICY = findByMetadataName(
  recordedNncps.items,
  'pw-int-fixture',
) as unknown as V1NodeNetworkConfigurationPolicy;
const ENACTMENT_NAMES = (
  recordedNnces.items as unknown as V1beta1NodeNetworkConfigurationEnactment[]
).map((enactment) => enactment.metadata.name);

const mockCluster = (policies: unknown[] = recordedNncps.items) => {
  mockList(POLICIES, policies);
  mockList(ENACTMENTS, recordedNnces.items);
  mockList(NODES, recordedNodes.items);
};

const renderList = () =>
  render(
    <RouterProvider>
      <PoliciesList />
      <LocationProbe />
    </RouterProvider>,
  );

/** Console page routing: the list gives way to the details page after a name click. */
const renderRoutedList = () => {
  const Routes = () => {
    const { pathname } = useLocation();
    return pathname.endsWith(`/${POLICY.metadata.name}`) ? (
      <PolicyDetailsPage obj={POLICY} />
    ) : (
      <PoliciesList />
    );
  };

  return render(
    <RouterProvider>
      <Routes />
    </RouterProvider>,
  );
};

const groupFor = async (term: string): Promise<HTMLElement> => {
  const group = (await screen.findByText(term)).closest('.pf-c-description-list__group');
  if (!group) {
    throw new Error(`No description group rendered for "${term}"`);
  }
  return group as HTMLElement;
};

describe('PoliciesList over the recorded console API payloads', () => {
  it('renders the recorded policy with its enactment count', async () => {
    mockCluster();
    renderList();

    expect(await screen.findByRole('link', { name: POLICY.metadata.name })).toBeTruthy();
    expect(screen.getByText(`${recordedNnces.items.length} nodes`)).toBeTruthy();
    expect(screen.getByText('Enactment states')).toBeTruthy();
  });

  it('opens the policy details page when the user clicks the policy name', async () => {
    const requestedPaths: string[] = [];
    server.events.on('request:start', ({ request }: { request: { url: string } }) => {
      requestedPaths.push(new URL(request.url).pathname);
    });

    mockCluster();
    renderRoutedList();

    fireEvent.click(await screen.findByRole('link', { name: POLICY.metadata.name }));

    expect(await screen.findByText('Policy details')).toBeTruthy();

    await waitFor(() =>
      expect(requestedPaths).toEqual(
        expect.arrayContaining([
          '/api/kubernetes/api/v1/nodes',
          '/api/kubernetes/apis/nmstate.io/v1beta1/nodenetworkconfigurationenactments',
        ]),
      ),
    );

    const matchedNodes = await groupFor('Number of nodes matched');
    await waitFor(() => expect(matchedNodes.textContent).toContain('3'));
    expect(matchedNodes.textContent).not.toContain('6');

    expect((await groupFor('Type')).textContent).toContain('dummy');
    expect((await groupFor('Network state')).textContent).toContain('up');
    expect((await groupFor('IP configuration')).textContent).toContain('None');

    expect(await screen.findByText('3 available enactments')).toBeTruthy();
    expect(screen.queryByText(/pending enactments/)).toBeNull();
    expect(screen.queryByText(/failing enactments/)).toBeNull();
  });

  it('opens the enactments drawer from the status count and expands an enactment', async () => {
    mockCluster();
    renderList();

    fireEvent.click(await screen.findByRole('button', { name: '3 Available' }));

    const drawer = await screen.findByRole('dialog');
    expect(within(drawer).getByText('Matched nodes summary')).toBeTruthy();
    for (const name of ENACTMENT_NAMES) {
      expect(within(drawer).getByText(name)).toBeTruthy();
    }

    fireEvent.click(within(drawer).getByRole('button', { name: ENACTMENT_NAMES[0] }));

    expect((await within(drawer).findAllByText('successfully reconciled')).length).toBeGreaterThan(
      0,
    );
  });

  it('filters the list by enactment state through the toolbar filter', async () => {
    mockCluster();
    renderList();

    fireEvent.click(await screen.findByRole('checkbox', { name: 'Available' }));
    await waitFor(() =>
      expect(screen.getByRole('link', { name: POLICY.metadata.name })).toBeTruthy(),
    );

    fireEvent.click(screen.getByRole('checkbox', { name: 'Available' }));
    fireEvent.click(screen.getByRole('checkbox', { name: 'Failing' }));

    expect(await screen.findByText('No NodeNetworkConfigurationPolicy found')).toBeTruthy();
  });

  it('starts the create form from the empty state', async () => {
    mockCluster([]);
    renderList();

    expect(await screen.findByText('No NodeNetworkConfigurationPolicy found')).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: 'Create NodeNetworkConfigurationPolicy' }));
    fireEvent.click(await screen.findByRole('button', { name: 'From Form' }));

    await waitFor(() =>
      expect(screen.getByTestId('location').textContent).toContain(
        '/node-network-configuration?createPolicy=true',
      ),
    );
  });
});
