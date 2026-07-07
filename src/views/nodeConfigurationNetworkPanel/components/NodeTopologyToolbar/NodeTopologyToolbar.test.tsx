import React from 'react';

import { cleanup, fireEvent, render, screen } from '@testing-library/react';

import NodeTopologyToolbar from './NodeTopologyToolbar';

const mockNavigate = jest.fn();

jest.mock('react-router', () => ({
  useNavigate: () => mockNavigate,
}));

afterEach(() => {
  cleanup();
  mockNavigate.mockReset();
});

describe('NodeTopologyToolbar', () => {
  it('renders the network title and cluster navigation link', () => {
    render(<NodeTopologyToolbar />);

    expect(screen.getByRole('heading', { name: 'Network' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'See all nodes in this cluster' })).toBeTruthy();
  });

  it('navigates to the cluster topology page when the link is clicked', () => {
    render(<NodeTopologyToolbar />);

    fireEvent.click(screen.getByRole('button', { name: 'See all nodes in this cluster' }));

    expect(mockNavigate).toHaveBeenCalledWith('/node-network-configuration');
  });
});
