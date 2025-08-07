import React, { FC, useEffect, useRef } from 'react';
import { useHistory } from 'react-router';
import NodeNetworkConfigurationPolicyModel from 'src/console-models/NodeNetworkConfigurationPolicyModel';
import { useImmer } from 'use-immer';

import { k8sCreate } from '@openshift-console/dynamic-plugin-sdk';
import { signal } from '@preact/signals-react';
import PolicyWizard from '@utils/components/PolicyForm/PolicyWizard/PolicyWizard';
import { initialPolicy } from '@utils/components/PolicyForm/PolicyWizard/utils/initialState';
import { getResourceUrl } from '@utils/helpers';
import {
  NNCP_ABANDONED,
  NNCP_CREATION_FAILED,
  NNCP_CREATION_STARTED,
} from '@utils/telemetry/constants';
import { logCreationFailed, logNMStateEvent, logNNCPCreated } from '@utils/telemetry/telemetry';

type CreatePolicyDrawerProps = {
  onClose?: () => void;
};

export const creatingPolicySignal = signal(initialPolicy);

const CreatePolicyDrawer: FC<CreatePolicyDrawerProps> = ({ onClose }) => {
  const [policy, setPolicy] = useImmer(initialPolicy);
  const completed = useRef(false);
  const currentStepId = useRef<string | number>('policy-wizard-basicinfo');
  const history = useHistory();

  creatingPolicySignal.value = policy;

  useEffect(() => {
    logNMStateEvent(NNCP_CREATION_STARTED);
  }, []);

  useEffect(() => {
    return () => {
      if (!completed.current) {
        logNMStateEvent(NNCP_ABANDONED, { stepId: currentStepId.current });
      }
    };
  }, []);

  const onSubmit = async () => {
    try {
      const createdPolicy = await k8sCreate({
        model: NodeNetworkConfigurationPolicyModel,
        data: policy,
      });

      completed.current = true;
      logNNCPCreated(createdPolicy);

      creatingPolicySignal.value = null;

      history.push(
        getResourceUrl({ model: NodeNetworkConfigurationPolicyModel, resource: createdPolicy }),
      );
    } catch (error) {
      completed.current = true;
      logCreationFailed(NNCP_CREATION_FAILED, error);
      throw error;
    }
  };

  const closeDrawer = () => {
    creatingPolicySignal.value = null;
    onClose();
  };

  return (
    <PolicyWizard
      policy={policy}
      setPolicy={setPolicy}
      onSubmit={onSubmit}
      onClose={closeDrawer}
      onStepChange={(stepId) => {
        currentStepId.current = stepId;
      }}
    />
  );
};

export default CreatePolicyDrawer;
