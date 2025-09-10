import NodeNetworkConfigurationPolicyModel from 'src/console-models/NodeNetworkConfigurationPolicyModel';

import { V1NodeNetworkConfigurationPolicy } from '@types';

export const initialPolicy: V1NodeNetworkConfigurationPolicy = {
  apiVersion: `${NodeNetworkConfigurationPolicyModel.apiGroup}/${NodeNetworkConfigurationPolicyModel.apiVersion}`,
  kind: NodeNetworkConfigurationPolicyModel.kind,
  metadata: {
    name: 'policy-name',
  },
  spec: {
    desiredState: {
      interfaces: [],
    },
  },
};

export const SELECTED_ID_QUERY_PARAM = 'selectedID';
export const CREATE_POLICY_QUERY_PARAM = 'createPolicy';
