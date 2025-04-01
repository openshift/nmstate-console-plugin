import React, { FC } from 'react';
import { useHistory } from 'react-router';
import NodeNetworkConfigurationPolicyModel from 'src/console-models/NodeNetworkConfigurationPolicyModel';
import { useImmer } from 'use-immer';

import { k8sCreate } from '@openshift-console/dynamic-plugin-sdk';
import PolicyWizard from '@utils/components/PolicyForm/PolicyWizard/PolicyWizard';
import { getResourceUrl } from '@utils/helpers';

import { initialPolicy } from './constants';

type CreatePolicyDrawerProps = {
  onClose?: () => void;
};

const CreatePolicyDrawer: FC<CreatePolicyDrawerProps> = ({ onClose }) => {
  const [policy, setPolicy] = useImmer(initialPolicy);
  const history = useHistory();

  const onSubmit = async () => {
    await k8sCreate({
      model: NodeNetworkConfigurationPolicyModel,
      data: policy,
    });

    history.push(getResourceUrl({ model: NodeNetworkConfigurationPolicyModel, resource: policy }));
  };

  return (
    <PolicyWizard policy={policy} setPolicy={setPolicy} onSubmit={onSubmit} onClose={onClose} />
  );
};

export default CreatePolicyDrawer;
