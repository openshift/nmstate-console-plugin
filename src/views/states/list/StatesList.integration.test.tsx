import React from 'react';
import { settle } from 'src/__mocks__/integration/act';
import { consoleApiPath, mockList } from 'src/__mocks__/integration/api';
import { RouterProvider, useLocation } from 'src/__mocks__/integration/react-router';
import recordedNns from 'src/__mocks__/integration/recordings/nns.json';
import recordedNodes from 'src/__mocks__/integration/recordings/nodes.json';
import StateDetailsPage from 'src/views/states/details/StateDetailsPage';
import StatesList from 'src/views/states/list/StatesList';

import { describe, expect, it } from '@jest/globals';
import type { V1beta1NodeNetworkState } from '@kubevirt-ui-ext/kubevirt-api/nmstate';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';

import lldpList from '../../../../cypress/fixtures/NodeNetworkStatusWithLLDP.json';

const NNS = consoleApiPath('nmstate.io', 'v1beta1', 'nodenetworkstates');
const NODES = consoleApiPath('', 'v1', 'nodes');

const renderList = async () => {
  render(
    <RouterProvider>
      <StatesList />
    </RouterProvider>,
  );
  await settle();
};

const mockCluster = (states: unknown[] = recordedNns.items) => {
  mockList(NNS, states);
  mockList(NODES, recordedNodes.items);
};

/**
 * The MenuToggle buttons rendered by the DataView filter toolbar. PatternFly portals the
 * group's children into the toolbar's expandable content once it is expanded, so the lookup
 * is scoped to the enclosing toolbar rather than to the filter group itself.
 */
const filterToggles = (): HTMLButtonElement[] => {
  const toolbar = document
    .querySelector('[data-test="states-list-filters"]')
    ?.closest('.pf-v6-c-toolbar');

  return toolbar
    ? [...toolbar.querySelectorAll<HTMLButtonElement>('button.pf-v6-c-menu-toggle')]
    : [];
};

/** Switches the DataView filter toolbar to the named filter. */
const chooseFilter = async (title: string) => {
  const [attributeToggle] = await waitFor(() => {
    const toggles = filterToggles();
    if (!toggles.length) {
      throw new Error('Filter toolbar did not render');
    }
    return toggles;
  });
  fireEvent.click(attributeToggle);
  fireEvent.click(await screen.findByRole('menuitem', { name: title }));
  await settle();
};

const openActiveFilter = async () => {
  const activeToggle = await waitFor(() => {
    const toggle = filterToggles()[1];
    if (!toggle) {
      throw new Error('The selected filter did not render its menu toggle');
    }
    return toggle;
  });
  fireEvent.click(activeToggle);
  await settle();
};

/** Names rendered in the visible state rows, in DOM order. */
const visibleStateNames = (): string[] =>
  [...document.querySelectorAll<HTMLAnchorElement>('tbody tr:not([hidden]) td a')].map(
    (link) => link.textContent,
  );

type LldpState = {
  metadata: { name: string };
  status: {
    currentState: {
      interfaces: {
        lldp?: { enabled?: boolean; neighbors?: Record<string, unknown>[][] };
        name: string;
        type: string;
      }[];
    };
  };
};

const LLDP_STATE = lldpList.items[0] as unknown as LldpState;
const LLDP_STATE_NAME = LLDP_STATE.metadata.name;
const LLDP_INTERFACE = LLDP_STATE.status.currentState.interfaces.find(
  (iface) => (iface.lldp?.neighbors ?? []).length > 0,
);
const LLDP_NEIGHBOUR_SYSTEM_NAME = LLDP_INTERFACE.lldp.neighbors
  .flat()
  .find((tlv) => 'system-name' in tlv)?.['system-name'] as string;
const LLDP_NEIGHBOUR_CHASSIS_ID = LLDP_INTERFACE.lldp.neighbors
  .flat()
  .find((tlv) => 'chassis-id' in tlv)?.['chassis-id'] as string;

describe('StatesList over the recorded console API payloads', () => {
  it('shows the empty state when the cluster has no NodeNetworkState', async () => {
    mockCluster([]);
    await renderList();

    expect(await screen.findByText('No NodeNetworkStates found')).toBeTruthy();
  });

  it('renders one row per recorded NodeNetworkState', async () => {
    mockCluster();
    await renderList();

    for (const state of recordedNns.items) {
      expect(await screen.findByText(state.metadata.name)).toBeTruthy();
    }
  });

  it('opens the state details page when the user clicks the node name', async () => {
    mockCluster();
    const state = recordedNns.items[0] as unknown as V1beta1NodeNetworkState;

    const Routes = () => {
      const { pathname } = useLocation();
      const selected = recordedNns.items.find((item) =>
        pathname.endsWith(`/${item.metadata.name}`),
      );
      return selected ? (
        <StateDetailsPage nns={selected as unknown as V1beta1NodeNetworkState} />
      ) : (
        <StatesList />
      );
    };

    render(
      <RouterProvider>
        <Routes />
      </RouterProvider>,
    );

    fireEvent.click(await screen.findByRole('link', { name: state.metadata.name }));

    expect(await screen.findByText('Created at')).toBeTruthy();
    expect(screen.getAllByText(state.metadata.name)).toHaveLength(2);
    expect(screen.getByText('0 Annotations')).toBeTruthy();
    expect(screen.getByText(state.metadata.creationTimestamp)).toBeTruthy();
  });

  it('expands every row and groups its interfaces by type', async () => {
    mockCluster();
    await renderList();

    fireEvent.click(await screen.findByRole('button', { name: 'Expand all' }));

    const types = new Set(
      recordedNns.items
        .flatMap((state) =>
          (state.status.currentState.interfaces as { type: string }[]).map((iface) => iface.type),
        )
        .filter((type) => type !== 'loopback'),
    );
    for (const type of types) {
      expect((await screen.findAllByText(type)).length).toBeGreaterThan(0);
    }
    expect(document.querySelectorAll('[data-test$="-open-drawer"]').length).toBeGreaterThan(0);
  });

  it('opens the interface drawer from an expanded row', async () => {
    mockCluster();
    await renderList();

    fireEvent.click(await screen.findByRole('button', { name: 'Expand all' }));
    const interfaceButton = await waitFor(() => {
      const button = document.querySelector<HTMLButtonElement>('[data-test$="-open-drawer"]');
      if (!button) {
        throw new Error('No interface row rendered');
      }
      return button;
    });

    fireEvent.click(interfaceButton);

    const drawer = await screen.findByRole('dialog');
    expect(within(drawer).getByText(interfaceButton.textContent)).toBeTruthy();
    expect(within(drawer).getByText('Details')).toBeTruthy();
    expect(within(drawer).getByText('LLDP')).toBeTruthy();
    expect(drawer.textContent).toContain('MAC Address');
  });

  it('shows LLDP neighbours in the interface drawer', async () => {
    mockList(NNS, lldpList.items);
    mockList(NODES, recordedNodes.items);
    await renderList();

    fireEvent.click(await screen.findByRole('button', { name: 'Expand all' }));
    const interfaceButton = await waitFor(() => {
      const button = document.querySelector<HTMLButtonElement>(
        `[data-test="ethernet-${LLDP_INTERFACE.name}-open-drawer"]`,
      );
      if (!button) {
        throw new Error('No LLDP interface row rendered');
      }
      return button;
    });

    fireEvent.click(interfaceButton);

    const drawer = await screen.findByRole('dialog');
    expect(within(drawer).getByText('Enabled')).toBeTruthy();
    expect(within(drawer).getByText('Neighbors')).toBeTruthy();
    // The neighbour fields render as "System Name: <value>" inside one stack item.
    expect(drawer.textContent).toContain(LLDP_NEIGHBOUR_SYSTEM_NAME);
    expect(drawer.textContent).toContain('MAC Address');
    // The chassis label comes from the TLV's `_description`, which is the protocol name; the
    // Cypress suite asserts on the same label, so a sanitizer that redacts it fails here first.
    expect(drawer.textContent).toContain(`MAC address: ${LLDP_NEIGHBOUR_CHASSIS_ID}`);
    expect(drawer.textContent).toContain('Port');
    expect(drawer.textContent).toContain('VLANS');
  });

  it('sorts rows by node name', async () => {
    mockCluster();
    await renderList();

    const nameHeader = await screen.findByRole('button', { name: 'Name' });
    fireEvent.click(nameHeader); // ascending
    const ascending = document.querySelector<HTMLElement>('tbody tr');
    expect(ascending.textContent).toContain('master-0');

    fireEvent.click(nameHeader); // descending
    await waitFor(() =>
      expect(document.querySelector<HTMLElement>('tbody tr').textContent).toContain('worker-2'),
    );
  });

  it('narrows the list through the node label filter and its suggestions', async () => {
    mockCluster();
    await renderList();

    await chooseFilter('Node label');
    fireEvent.change(screen.getByPlaceholderText('Search by node label (e.g. key=value)...'), {
      target: { value: 'kubernetes.io/hostname=worker-1' },
    });
    fireEvent.click(
      await screen.findByRole('menuitem', { name: 'kubernetes.io/hostname=worker-1' }),
    );

    await waitFor(() => expect(visibleStateNames()).toEqual(['worker-1']));
  });

  it('narrows the list by a bare node label key', async () => {
    mockCluster();
    await renderList();

    await chooseFilter('Node label');
    fireEvent.change(screen.getByPlaceholderText('Search by node label (e.g. key=value)...'), {
      target: { value: 'node-role.kubernetes.io/worker' },
    });
    fireEvent.click(
      await screen.findByRole('menuitem', { name: 'node-role.kubernetes.io/worker' }),
    );

    await waitFor(() => expect(visibleStateNames()).toEqual(['worker-0', 'worker-1', 'worker-2']));
  });

  it('narrows the list through the interface state checkbox filter', async () => {
    mockCluster();
    await renderList();

    await chooseFilter('Interface state');
    await openActiveFilter();
    fireEvent.click(await screen.findByRole('checkbox', { name: 'Down' }));

    // Literal names from the committed recording; re-record and update them together.
    await waitFor(() => expect(visibleStateNames()).toEqual(['worker-0', 'worker-1']));
  });

  it('narrows the list to nodes with LLDP enabled', async () => {
    mockList(NNS, lldpList.items);
    mockList(NODES, recordedNodes.items);
    await renderList();

    await chooseFilter('LLDP');
    await openActiveFilter();
    fireEvent.click(await screen.findByRole('checkbox', { name: 'Enabled' }));

    await waitFor(() => expect(visibleStateNames()).toEqual([LLDP_STATE_NAME]));
  });

  it('keeps nodes whose interfaces have LLDP disabled', async () => {
    mockCluster();
    await renderList();

    await chooseFilter('LLDP');
    await openActiveFilter();
    fireEvent.click(await screen.findByRole('checkbox', { name: 'Disabled' }));

    await waitFor(() =>
      expect(visibleStateNames()).toEqual(recordedNns.items.map((state) => state.metadata.name)),
    );
  });

  it('matches an LLDP neighbour VLAN name', async () => {
    mockList(NNS, lldpList.items);
    mockList(NODES, recordedNodes.items);
    await renderList();

    await chooseFilter('LLDP VLAN name');
    fireEvent.change(await screen.findByPlaceholderText('Search by VLAN name...'), {
      target: { value: 'vlan-1000' },
    });

    await waitFor(() => expect(visibleStateNames()).toEqual([LLDP_STATE_NAME]));
  });

  it('matches an LLDP neighbour system name', async () => {
    mockList(NNS, lldpList.items);
    mockList(NODES, recordedNodes.items);
    await renderList();

    await chooseFilter('LLDP system name');
    fireEvent.change(await screen.findByPlaceholderText('Search by LLDP system name...'), {
      target: { value: LLDP_NEIGHBOUR_SYSTEM_NAME.slice(0, 10) },
    });

    await waitFor(() => expect(visibleStateNames()).toEqual([LLDP_STATE_NAME]));
  });
});
