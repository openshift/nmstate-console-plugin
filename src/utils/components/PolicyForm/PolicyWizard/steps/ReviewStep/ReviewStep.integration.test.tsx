import React from 'react';
import { http, HttpResponse } from 'msw';
import { consoleApiPath } from 'src/__mocks__/integration/api';
import recordedSettingsPolicy from 'src/__mocks__/integration/recordings/policy-settings.json' with { type: 'json' };
import { server } from 'src/__mocks__/integration/server';

import { describe, expect, it, jest } from '@jest/globals';
import type { V1NodeNetworkConfigurationPolicy } from '@kubevirt-ui-ext/kubevirt-api/nmstate';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import ReviewStep from './ReviewStep';

const POLICIES = consoleApiPath('nmstate.io', 'v1', 'nodenetworkconfigurationpolicies');

const REVIEW_POLICY = recordedSettingsPolicy as unknown as V1NodeNetworkConfigurationPolicy;

describe('ReviewStep', () => {
  it('validates the YAML copy with a dry-run create request', async () => {
    let body: V1NodeNetworkConfigurationPolicy | undefined;
    let query: string | undefined;
    server.use(
      http.post(POLICIES, async ({ request }) => {
        query = new URL(request.url).search;
        body = (await request.json()) as V1NodeNetworkConfigurationPolicy;
        return HttpResponse.json(body);
      }),
    );

    const setPolicy = jest.fn();
    render(
      <ReviewStep
        createAnotherPolicyState={[false, jest.fn()]}
        policy={REVIEW_POLICY}
        setPolicy={setPolicy}
      />,
    );

    fireEvent.click(await screen.findByRole('switch', { name: /Edit YAML/ }));

    const editor = (await screen.findByTestId('yaml-editor')) as HTMLTextAreaElement;
    fireEvent.change(editor, {
      target: {
        value: editor.value.replace("name: 'pw-int-settings'", "name: 'pw-int-settings-edited'"),
      },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() => expect(body).toBeDefined());
    expect(query).toContain('dryRun=All');
    expect(body?.metadata.name).toBe('pw-int-settings-edited');
    await waitFor(() => expect(setPolicy).toHaveBeenCalled());
  });
});
