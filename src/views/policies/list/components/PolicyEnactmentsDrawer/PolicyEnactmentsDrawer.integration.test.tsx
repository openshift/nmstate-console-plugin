import React from 'react';
import { findByMetadataName } from 'src/__mocks__/integration/api';
import recordedNnces from 'src/__mocks__/integration/recordings/nnces.json';
import recordedNncps from 'src/__mocks__/integration/recordings/nncps.json';
import { EnactmentStatuses } from 'src/views/policies/constants';

import { describe, expect, it, jest } from '@jest/globals';
import type {
  V1beta1NodeNetworkConfigurationEnactment,
  V1NodeNetworkConfigurationPolicy,
} from '@kubevirt-ui-ext/kubevirt-api/nmstate';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';

import PolicyEnactmentsDrawer from './PolicyEnactmentsDrawer';

const POLICY = findByMetadataName(
  recordedNncps.items,
  'pw-int-fixture',
) as unknown as V1NodeNetworkConfigurationPolicy;
const ENACTMENTS = recordedNnces.items as unknown as V1beta1NodeNetworkConfigurationEnactment[];

describe('PolicyEnactmentsDrawer over the recorded enactments', () => {
  it('lists the enactments, expands their conditions, and closes on request', async () => {
    const onClose = jest.fn();
    render(
      <PolicyEnactmentsDrawer
        enactments={ENACTMENTS}
        onClose={onClose}
        selectedPolicy={POLICY}
        selectedState={EnactmentStatuses.Available}
      />,
    );

    const drawer = await screen.findByRole('dialog');
    expect(within(drawer).getByText('Matched nodes summary')).toBeTruthy();
    for (const enactment of ENACTMENTS) {
      expect(within(drawer).getByText(enactment.metadata.name)).toBeTruthy();
    }

    fireEvent.click(within(drawer).getByRole('button', { name: ENACTMENTS[0].metadata.name }));

    expect((await within(drawer).findAllByText('successfully reconciled')).length).toBeGreaterThan(
      0,
    );

    fireEvent.click(within(drawer).getByRole('button', { name: 'Close' }));

    await waitFor(() => expect(onClose).toHaveBeenCalled());
  });
});
