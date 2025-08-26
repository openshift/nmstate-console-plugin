import React, { FC } from 'react';

import { Content, FormGroup, Radio } from '@patternfly/react-core';
import { InterfaceType, NodeNetworkConfigurationInterface } from '@types';
import { isEmpty } from '@utils/helpers';
import { useNMStateTranslation } from '@utils/hooks/useNMStateTranslation';
import { OVN_BRIDGE_MAPPINGS } from '@utils/resources/ovn/constants';
import { getOVNConfiguration } from '@utils/resources/policies/getters';

import { INTERFACE_TYPE_LABEL, onInterfaceChangeType } from '../../constants';
import { doesOVSBridgeExist } from '../../utils';

type BridgeTypeProps = {
  policyInterface?: NodeNetworkConfigurationInterface;
  onInterfaceChange?: (updateInterface: onInterfaceChangeType) => void;
  id: number | string;
};

const BridgeType: FC<BridgeTypeProps> = ({ policyInterface, onInterfaceChange, id }) => {
  const { t } = useNMStateTranslation();

  const handleTypechange = (newType: string) => {
    onInterfaceChange((draftInterface, draftPolicy) => {
      draftInterface.type = newType as InterfaceType;
      !doesOVSBridgeExist(draftPolicy) && delete draftPolicy.spec.desiredState.ovn;

      if (newType === InterfaceType.LINUX_BRIDGE) {
        delete draftInterface['link-aggregation'];
        draftInterface.bridge = { port: [], options: { stp: { enabled: false } } };
      }

      if (newType === InterfaceType.OVS_BRIDGE) {
        delete draftInterface['link-aggregation'];
        draftInterface.bridge = { port: [], options: {} };

        if (isEmpty(getOVNConfiguration(draftPolicy))) {
          draftPolicy.spec.desiredState.ovn = {
            [OVN_BRIDGE_MAPPINGS]: [],
          };
        }

        draftPolicy.spec.desiredState.ovn[OVN_BRIDGE_MAPPINGS].push({
          bridge: '',
          localnet: '',
          state: 'present',
        });
      }
    });
  };

  return (
    <FormGroup label={t('Bridge type')} isRequired fieldId={`policy-interface-bridge-type-${id}`}>
      <Content className="policy-form-content__content-description">
        {t('Select a bridge type below to determine how your network traffic will be handled.')}
      </Content>
      <Radio
        isChecked={policyInterface.type === InterfaceType.LINUX_BRIDGE}
        name="bridge-type"
        onChange={() => handleTypechange(InterfaceType.LINUX_BRIDGE)}
        label={INTERFACE_TYPE_LABEL[InterfaceType.LINUX_BRIDGE]}
        id="bridge-type-linux-bridge"
        description={t('Best for straightforward bridging using the built-in Linux functionality.')}
      ></Radio>

      <Radio
        isChecked={policyInterface.type === InterfaceType.OVS_BRIDGE}
        name="bridge-type"
        onChange={() => handleTypechange(InterfaceType.OVS_BRIDGE)}
        label={INTERFACE_TYPE_LABEL[InterfaceType.OVS_BRIDGE]}
        id="bridge-type-ovs-bridge"
        description={t(
          'Ideal for environments needing advanced, software-defined networking features.',
        )}
      ></Radio>
    </FormGroup>
  );
};

export default BridgeType;
