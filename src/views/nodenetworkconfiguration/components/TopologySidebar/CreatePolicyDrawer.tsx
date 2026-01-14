import React, { FC, useEffect, useRef, useState } from 'react';
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
  const [wizardKey, setWizardKey] = useState(0);
  const [lastCreatedPolicyName, setLastCreatedPolicyName] = useState<string>('');
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

  const onSubmit = async (createAnother: boolean) => {
    try {
      const createdPolicy = await k8sCreate({
        model: NodeNetworkConfigurationPolicyModel,
        data: policy,
      });

      completed.current = true;
      logNNCPCreated(createdPolicy);

      if (createAnother) {
        setPolicy(initialPolicy);
        creatingPolicySignal.value = initialPolicy;
        completed.current = false;
        setWizardKey((prev) => prev + 1);
        setLastCreatedPolicyName(createdPolicy.metadata.name);
        return;
      }

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
      key={wizardKey}
      policy={policy}
      setPolicy={setPolicy}
      onSubmit={onSubmit}
      onClose={closeDrawer}
      onStepChange={(stepId) => {
        currentStepId.current = stepId;
      }}
      lastCreatedPolicyName={lastCreatedPolicyName}
      clearSuccessMessage={() => setLastCreatedPolicyName('')}
    />
  );
};

export default CreatePolicyDrawer;
