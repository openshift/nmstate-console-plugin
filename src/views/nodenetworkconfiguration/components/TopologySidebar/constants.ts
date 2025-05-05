import NodeNetworkConfigurationPolicyModel from 'src/console-models/NodeNetworkConfigurationPolicyModel';

import {
  InterfaceType,
  NodeNetworkConfigurationInterface,
  V1NodeNetworkConfigurationPolicy,
} from '@types';
import { NETWORK_STATES } from '@utils/components/PolicyForm/constants';

export const initialPolicy: V1NodeNetworkConfigurationPolicy = {
  apiVersion: `${NodeNetworkConfigurationPolicyModel.apiGroup}/${NodeNetworkConfigurationPolicyModel.apiVersion}`,
  kind: NodeNetworkConfigurationPolicyModel.kind,
  metadata: {
    name: 'policy-name',
  },
  spec: {
    desiredState: {
      interfaces: [
        {
          name: 'br0',
          type: InterfaceType.LINUX_BRIDGE,
          state: NETWORK_STATES.Up,
          bridge: {
            options: {
              stp: {
                enabled: false,
              },
            },
          },
        } as NodeNetworkConfigurationInterface,
      ],
    },
  },
};

export const SELECTED_ID_QUERY_PARAM = 'selectedID';
export const CREATE_POLICY_QUERY_PARAM = 'createPolicy';
