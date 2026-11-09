import React from 'react';
import { http, HttpResponse } from 'msw';
import { consoleApiPath, findByMetadataName } from 'src/__mocks__/integration/api';
import { setAccessReview } from 'src/__mocks__/integration/dynamic-plugin-sdk';
import { RouterProvider } from 'src/__mocks__/integration/react-router';
import recordedNncps from 'src/__mocks__/integration/recordings/nncps.json' with { type: 'json' };
import recordedEditablePolicy from 'src/__mocks__/integration/recordings/policy-editable.json' with { type: 'json' };
import { server } from 'src/__mocks__/integration/server';

import { afterEach, describe, expect, it } from '@jest/globals';
import type { V1NodeNetworkConfigurationPolicy } from '@kubevirt-ui-ext/kubevirt-api/nmstate';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import PolicyActions from './PolicyActions';

const POLICY = findByMetadataName(
  recordedNncps.items,
  'pw-int-fixture',
) as unknown as V1NodeNetworkConfigurationPolicy;
const POLICY_PATH = `${consoleApiPath('nmstate.io', 'v1', 'nodenetworkconfigurationpolicies')}/${POLICY.metadata.name}`;

// The recorded fixture uses a `dummy` interface, which the form editor does not support;
// the kebab falls back to the YAML editor for it. The editable shape exercises the modal.
const EDITABLE_POLICY = recordedEditablePolicy as unknown as V1NodeNetworkConfigurationPolicy;
const EDITABLE_POLICY_PATH = `${consoleApiPath('nmstate.io', 'v1', 'nodenetworkconfigurationpolicies')}/${EDITABLE_POLICY.metadata.name}`;

afterEach(() => setAccessReview([true, false]));

const renderActions = (policy: V1NodeNetworkConfigurationPolicy = POLICY) =>
  render(
    <RouterProvider>
      <PolicyActions isKebabToggle policy={policy} />
    </RouterProvider>,
  );

describe('PolicyActions', () => {
  it('offers edit and delete, then deletes the policy through the confirmation modal', async () => {
    let deletedPath: string | undefined;
    server.use(
      http.delete(POLICY_PATH, ({ request }) => {
        deletedPath = new URL(request.url).pathname;
        return HttpResponse.json({ kind: 'Status', status: 'Success' });
      }),
    );

    renderActions();

    fireEvent.click(screen.getByRole('button'));

    const deleteItem = await screen.findByRole('menuitem', { name: /^Delete/ });
    expect(screen.getByRole('menuitem', { name: /^Edit/ })).toBeTruthy();
    fireEvent.click(deleteItem);

    const deleteButton = await screen.findByRole('button', { name: 'Delete' });
    fireEvent.change(screen.getByLabelText('Enter name'), { target: { value: 'wrong-name' } });
    expect(deleteButton.hasAttribute('disabled')).toBe(true);

    fireEvent.change(screen.getByLabelText('Enter name'), {
      target: { value: POLICY.metadata.name },
    });
    fireEvent.click(deleteButton);

    await waitFor(() =>
      expect(deletedPath).toBe(
        `/api/kubernetes/apis/nmstate.io/v1/nodenetworkconfigurationpolicies/${POLICY.metadata.name}`,
      ),
    );
  });

  it('edits the policy through the kebab menu and saves the form as a PUT', async () => {
    let updated: V1NodeNetworkConfigurationPolicy | undefined;
    server.use(
      http.put(EDITABLE_POLICY_PATH, async ({ request }) => {
        updated = (await request.json()) as V1NodeNetworkConfigurationPolicy;
        return HttpResponse.json(updated);
      }),
    );

    renderActions(EDITABLE_POLICY);

    fireEvent.click(screen.getByRole('button'));
    fireEvent.click(await screen.findByRole('menuitem', { name: /^Edit/ }));

    expect(await screen.findByText('Edit NodeNetworkConfigurationPolicy')).toBeTruthy();

    const description = await waitFor(() => {
      const input = document.querySelector<HTMLInputElement>('#policy-description');
      if (!input) {
        throw new Error('The edit form did not render the description field');
      }
      return input;
    });
    fireEvent.change(description, { target: { value: 'edited from the list kebab' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() => expect(updated).toBeDefined());
    expect(updated?.metadata.annotations?.description).toBe('edited from the list kebab');
    await waitFor(() =>
      expect(screen.queryByText('Edit NodeNetworkConfigurationPolicy')).toBeNull(),
    );
  });

  it('disables both actions when the user cannot update or delete policies', async () => {
    setAccessReview([false, true]);

    renderActions();
    fireEvent.click(screen.getByRole('button'));

    await waitFor(() =>
      expect(screen.getByRole('menuitem', { name: /^Edit/ }).hasAttribute('disabled')).toBe(true),
    );
    expect(screen.getByRole('menuitem', { name: /^Delete/ }).hasAttribute('disabled')).toBe(true);
  });
});
