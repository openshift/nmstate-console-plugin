import NodeNetworkConfigurationPolicyModel from 'src/console-models/NodeNetworkConfigurationPolicyModel';

import {
  InterfaceType,
  NodeNetworkConfigurationInterface,
  V1NodeNetworkConfigurationPolicy,
} from '@types';
import { DEFAULT_MTU } from '@utils/components/PolicyForm/PolicyWizard/steps/ConfigurationStep/utils/constants';
import { NETWORK_STATES } from '@utils/components/PolicyForm/utils/constants';
import { getRandomChars } from '@utils/helpers';
import { OVN_BRIDGE_MAPPINGS } from '@utils/resources/ovn/constants';

export const initialPolicy: V1NodeNetworkConfigurationPolicy = {
  apiVersion: `${NodeNetworkConfigurationPolicyModel.apiGroup}/${NodeNetworkConfigurationPolicyModel.apiVersion}`,
  kind: NodeNetworkConfigurationPolicyModel.kind,
  metadata: {
    name: `policy-${getRandomChars(8)}`,
  },
  spec: {
    desiredState: {
      interfaces: [
        {
          name: 'br0',
          type: InterfaceType.OVS_BRIDGE,
          state: NETWORK_STATES.Up,
          mtu: DEFAULT_MTU,
          bridge: {
            options: {
              stp: {
                enabled: false,
              },
            },
          },
        } as NodeNetworkConfigurationInterface,
      ],
      ovn: {
        [OVN_BRIDGE_MAPPINGS]: [
          {
            bridge: 'br0',
            localnet: '',
            state: 'present',
          },
        ],
      },
    },
  },
};

export const SELECTED_ID_QUERY_PARAM = 'selectedID';
export const CREATE_POLICY_QUERY_PARAM = 'createPolicy';
