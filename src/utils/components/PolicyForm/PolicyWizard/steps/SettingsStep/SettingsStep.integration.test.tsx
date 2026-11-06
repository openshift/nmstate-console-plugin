import React, { useState } from 'react';
import { produce } from 'immer';
import { settle } from 'src/__mocks__/integration/act';
import { consoleApiPath, mockList } from 'src/__mocks__/integration/api';
import recordedNns from 'src/__mocks__/integration/recordings/nns.json';
import recordedNodes from 'src/__mocks__/integration/recordings/nodes.json';
import recordedSettingsPolicy from 'src/__mocks__/integration/recordings/policy-settings.json';

import { describe, expect, it } from '@jest/globals';
import type { V1NodeNetworkConfigurationPolicy } from '@kubevirt-ui-ext/kubevirt-api/nmstate';
import { fireEvent, render, screen } from '@testing-library/react';

import SettingsStep from './SettingsStep';

const NODES = consoleApiPath('', 'v1', 'nodes');
const NNS = consoleApiPath('nmstate.io', 'v1beta1', 'nodenetworkstates');

const SETTINGS_POLICY = recordedSettingsPolicy as unknown as V1NodeNetworkConfigurationPolicy;

const Harness = () => {
  const [policy, setPolicy] = useState<V1NodeNetworkConfigurationPolicy>(SETTINGS_POLICY);
  const update = (recipe: Parameters<typeof produce>[1]) =>
    setPolicy((current) => produce(current, recipe));

  return (
    <>
      <SettingsStep policy={policy} setPolicy={update} />
      <pre data-testid="draft">{JSON.stringify(policy)}</pre>
    </>
  );
};

const draft = (): V1NodeNetworkConfigurationPolicy =>
  JSON.parse(screen.getByTestId('draft').textContent) as V1NodeNetworkConfigurationPolicy;

describe('SettingsStep', () => {
  it('renames the bridge and its management interface', async () => {
    mockList(NODES, recordedNodes.items);
    mockList(NNS, recordedNns.items);
    render(<Harness />);
    await settle();

    fireEvent.change(document.querySelector<HTMLInputElement>('#bridge-name'), {
      target: { value: 'br-lab' },
    });

    const interfaces = draft().spec.desiredState.interfaces;
    expect(interfaces.every((iface) => iface.name === 'br-lab')).toBe(true);
    expect(draft().spec.desiredState.ovn['bridge-mappings'][0].bridge).toBe('br-lab');
  });

  it('writes the MTU into the management interface', async () => {
    mockList(NODES, recordedNodes.items);
    mockList(NNS, recordedNns.items);
    render(<Harness />);
    await settle();

    fireEvent.change(document.querySelector<HTMLInputElement>('#mtu'), {
      target: { value: '1400' },
    });

    const managementInterface = draft().spec.desiredState.interfaces.find(
      (iface) => iface.type === 'ovs-interface',
    );
    expect(managementInterface.mtu).toBe('1400');
  });

  it('rejects an MTU outside the supported range', async () => {
    mockList(NODES, recordedNodes.items);
    mockList(NNS, recordedNns.items);
    render(<Harness />);
    await settle();

    fireEvent.change(document.querySelector<HTMLInputElement>('#mtu'), {
      target: { value: '999999' },
    });

    expect(await screen.findByText('Value must be between 1,280 and 9,000.')).toBeTruthy();
  });
});
