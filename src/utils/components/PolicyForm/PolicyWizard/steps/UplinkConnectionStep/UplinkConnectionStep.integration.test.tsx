import React, { useState } from 'react';
import { produce } from 'immer';
import { settle } from 'src/__mocks__/integration/act';
import { consoleApiPath, mockList } from 'src/__mocks__/integration/api';
import recordedNns from 'src/__mocks__/integration/recordings/nns.json' with { type: 'json' };
import recordedNodes from 'src/__mocks__/integration/recordings/nodes.json' with { type: 'json' };
import recordedUplinkPolicy from 'src/__mocks__/integration/recordings/policy-uplink.json' with { type: 'json' };

import { describe, expect, it } from '@jest/globals';
import type { V1NodeNetworkConfigurationPolicy } from '@kubevirt-ui-ext/kubevirt-api/nmstate';
import { fireEvent, render, screen } from '@testing-library/react';

import UplinkConnectionStep from './UplinkConnectionStep';

const NODES = consoleApiPath('', 'v1', 'nodes');
const NNS = consoleApiPath('nmstate.io', 'v1beta1', 'nodenetworkstates');

const BREX_POLICY = recordedUplinkPolicy as unknown as V1NodeNetworkConfigurationPolicy;

const Harness = () => {
  const [policy, setPolicy] = useState<V1NodeNetworkConfigurationPolicy>(BREX_POLICY);
  const update = (recipe: Parameters<typeof produce>[1]) =>
    setPolicy((current) => produce(current, recipe));

  return (
    <>
      <UplinkConnectionStep policy={policy} setPolicy={update} />
      <pre data-testid="draft">{JSON.stringify(policy)}</pre>
    </>
  );
};

const draft = (): V1NodeNetworkConfigurationPolicy =>
  JSON.parse(screen.getByTestId('draft').textContent) as V1NodeNetworkConfigurationPolicy;

const mockCluster = () => {
  mockList(NODES, recordedNodes.items);
  mockList(NNS, recordedNns.items);
};

describe('UplinkConnectionStep', () => {
  it('starts on the default node network for a br-ex policy', async () => {
    mockCluster();
    render(<Harness />);
    await settle();

    expect(
      (await screen.findByRole('radio', { name: /Default node network/ })).hasAttribute('checked'),
    ).toBe(true);
  });

  it('builds a bond and an OVS bridge when bonding is selected', async () => {
    mockCluster();
    render(<Harness />);
    await settle();

    fireEvent.click(await screen.findByRole('radio', { name: /Bonding interface/ }));
    // Mounting the bonding content starts a resource watch; let it resolve inside act.
    await settle();

    const interfaces = draft().spec.desiredState.interfaces;
    expect(interfaces.map((iface) => iface.type).sort()).toEqual(['ovs-bridge', 'ovs-interface']);

    // The bond is a port of the OVS bridge, not a top-level interface; its member
    // interfaces stay empty until the user picks them in the bonding content.
    const bridgePorts = interfaces.find((iface) => iface.type === 'ovs-bridge').bridge.port;
    const bondPort = bridgePorts.find(
      (port: { 'link-aggregation'?: unknown; name?: string }) => port['link-aggregation'],
    );
    expect(bondPort.name).toMatch(/^bond-/);
    expect(bondPort['link-aggregation']).toEqual({ mode: 'balance-slb', port: [] });
  });

  it('replaces the interfaces with an OVS bridge on a single interface', async () => {
    mockCluster();
    render(<Harness />);
    await settle();

    fireEvent.click(await screen.findByRole('radio', { name: /A single interface/ }));

    const interfaces = draft().spec.desiredState.interfaces;
    expect(interfaces.map((iface) => iface.type).sort()).toEqual(['ovs-bridge', 'ovs-interface']);
  });
});
