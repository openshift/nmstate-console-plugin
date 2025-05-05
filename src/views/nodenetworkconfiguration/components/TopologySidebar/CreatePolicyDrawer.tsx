import React, { FC } from 'react';
import { useHistory } from 'react-router';
import NodeNetworkConfigurationPolicyModel from 'src/console-models/NodeNetworkConfigurationPolicyModel';
import { useImmer } from 'use-immer';

import { k8sCreate } from '@openshift-console/dynamic-plugin-sdk';
import { signal } from '@preact/signals-react';
import PolicyWizard from '@utils/components/PolicyForm/PolicyWizard/PolicyWizard';
import { getResourceUrl } from '@utils/helpers';

import { initialPolicy } from './constants';

type CreatePolicyDrawerProps = {
  onClose?: () => void;
};

export const creatingPolicySignal = signal(initialPolicy);

const CreatePolicyDrawer: FC<CreatePolicyDrawerProps> = ({ onClose }) => {
  const [policy, setPolicy] = useImmer(initialPolicy);
  const history = useHistory();

  creatingPolicySignal.value = policy;

  const onSubmit = async () => {
    await k8sCreate({
      model: NodeNetworkConfigurationPolicyModel,
      data: policy,
    });

    creatingPolicySignal.value = null;

    history.push(getResourceUrl({ model: NodeNetworkConfigurationPolicyModel, resource: policy }));
  };

  const closeDrawer = () => {
    creatingPolicySignal.value = null;
    onClose();
  };

  return (
    <PolicyWizard policy={policy} setPolicy={setPolicy} onSubmit={onSubmit} onClose={closeDrawer} />
  );
};

export default CreatePolicyDrawer;
