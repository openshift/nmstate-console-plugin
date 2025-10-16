import React, { FC } from 'react';

import { NodeNetworkConfigurationInterface } from '@kubevirt-ui/kubevirt-api/nmstate';
import { Content, FormGroup, Radio } from '@patternfly/react-core';
import { useNMStateTranslation } from '@utils/hooks/useNMStateTranslation';

import { NETWORK_STATES, onInterfaceChangeType } from '../constants';

type NetworkStateProps = {
  policyInterface?: NodeNetworkConfigurationInterface;
  onInterfaceChange?: (updateInterface: onInterfaceChangeType) => void;
  id: number | string;
};

const NetworkState: FC<NetworkStateProps> = ({ policyInterface, onInterfaceChange, id }) => {
  const { t } = useNMStateTranslation();

  const handleStateChange = (newState: NETWORK_STATES) => {
    onInterfaceChange((draftInterface) => (draftInterface.state = newState));
  };

  return (
    <FormGroup
      label={t('Network state')}
      isRequired
      fieldId={`policy-interface-network-state-${id}`}
    >
      <Content className="policy-form-content__content-description">
        {t(
          'Network state controls whether the Linux bridge is active and participating in network traffic.',
        )}
      </Content>
      <Radio
        isChecked={policyInterface.state === NETWORK_STATES.Up}
        name="network-state"
        onChange={() => handleStateChange(NETWORK_STATES.Up)}
        label="Up"
        id="network-state-up"
        description={t('The interface is active and passing traffic.')}
      ></Radio>

      <Radio
        isChecked={policyInterface.state === NETWORK_STATES.Down}
        name="network-state"
        onChange={() => handleStateChange(NETWORK_STATES.Down)}
        label="Down"
        id="network-state-down"
        description={t('The interface is inactive but configured.')}
      ></Radio>

      <Radio
        isChecked={policyInterface.state === NETWORK_STATES.Absent}
        name="network-state"
        onChange={() => handleStateChange(NETWORK_STATES.Absent)}
        label="Absent"
        description={t('The interface is removed from the configuration.')}
        id="network-state-absent"
      ></Radio>
    </FormGroup>
  );
};

export default NetworkState;
