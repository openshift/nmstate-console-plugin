import React from 'react';

import { IoK8sApiCoreV1Node } from '@kubevirt-ui/kubevirt-api/kubernetes/models';
import { InterfaceType, V1NodeNetworkConfigurationPolicy } from '@kubevirt-ui/kubevirt-api/nmstate';
import { useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';
import { cleanup, render, screen } from '@testing-library/react';

import NodeNetworkingPoliciesPanel from './NodeNetworkingPoliciesPanel';

jest.mock('react-router', () => ({
  Link: ({ to, children, ...props }: { to: string; children: React.ReactNode }) => (
    <a href={to} {...props}>
      {children}
    </a>
  ),
}));

jest.mock('@openshift-console/dynamic-plugin-sdk', () => ({
  ResourceLink: ({ name }: { name: string }) => <span>{name}</span>,
  useK8sWatchResource: jest.fn(),
}));

const mockUseK8sWatchResource = useK8sWatchResource as jest.Mock;

const node = {
  metadata: {
    name: 'worker-0',
    labels: {
      'node-role.kubernetes.io/worker': '',
    },
  },
} as IoK8sApiCoreV1Node;

const createPolicy = (
  name: string,
  nodeSelector?: Record<string, string>,
): V1NodeNetworkConfigurationPolicy =>
  ({
    metadata: { name, uid: `${name}-uid` },
    spec: {
      nodeSelector,
      desiredState: {
        interfaces: [{ name: 'eth0', type: InterfaceType.ETHERNET }],
      },
    },
  } as V1NodeNetworkConfigurationPolicy);

const renderPanel = (
  policies: V1NodeNetworkConfigurationPolicy[] | null,
  loaded: boolean,
  error: { message: string } | null = null,
) => {
  mockUseK8sWatchResource.mockReturnValue([policies, loaded, error]);
  return render(<NodeNetworkingPoliciesPanel node={node} />);
};

afterEach(() => {
  cleanup();
  mockUseK8sWatchResource.mockReset();
});

describe('NodeNetworkingPoliciesPanel', () => {
  it('shows a loading spinner while policies are loading', () => {
    renderPanel(null, false);

    expect(screen.getByRole('progressbar')).toBeTruthy();
  });

  it('shows an error message when policy loading fails', () => {
    renderPanel(null, true, { message: 'Failed to load policies' });

    expect(screen.getByText('Failed to load policies')).toBeTruthy();
  });

  it('shows empty state when no policies apply to the node', () => {
    const policy = createPolicy('cluster-policy', {
      'node-role.kubernetes.io/control-plane': '',
    });
    renderPanel([policy], true);

    expect(screen.getByText('No networking policies apply to this node.')).toBeTruthy();
  });

  it('lists policies that apply to the node sorted by name', () => {
    const policies = [
      createPolicy('policy-b', { 'node-role.kubernetes.io/worker': '' }),
      createPolicy('policy-a'),
      createPolicy('policy-c', { 'node-role.kubernetes.io/control-plane': '' }),
    ];
    renderPanel(policies, true);

    expect(screen.getByText('policy-a')).toBeTruthy();
    expect(screen.getByText('policy-b')).toBeTruthy();
    expect(screen.queryByText('policy-c')).toBeNull();

    const policyNames = screen.getAllByText(/^policy-[ab]$/).map((element) => element.textContent);
    expect(policyNames).toEqual(['policy-a', 'policy-b']);
  });

  it('shows the link to all NodeNetworkConfigurationPolicies', () => {
    renderPanel([], true);

    expect(
      screen.getByRole('link', { name: 'See all NodeNetworkConfigurationPolicies' }),
    ).toBeTruthy();
  });
});
