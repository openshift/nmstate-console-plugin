import React, { FC } from 'react';

import {
  InterfaceType,
  NodeNetworkConfigurationInterface,
} from '@kubevirt-ui/kubevirt-api/nmstate';
import {
  Content,
  FormGroup,
  FormHelperText,
  HelperText,
  HelperTextItem,
  TextInput,
} from '@patternfly/react-core';
import { ensurePath } from '@utils/helpers';
import { useNMStateTranslation } from '@utils/hooks/useNMStateTranslation';

import { onInterfaceChangeType } from '../utils/constants';

type PortConfigurationProps = {
  policyInterface?: NodeNetworkConfigurationInterface;
  onInterfaceChange?: (updateInterface: onInterfaceChangeType) => void;
  id: number | string;
};

const PortConfiguration: FC<PortConfigurationProps> = ({
  policyInterface,
  onInterfaceChange,
  id,
}) => {
  const { t } = useNMStateTranslation();

  const onPortChange = (value: string) => {
    onInterfaceChange((draftInterface) => {
      if (draftInterface.type === InterfaceType.BOND) {
        ensurePath(draftInterface, 'link-aggregation.port');

        value
          ? (draftInterface['link-aggregation'].port = value.split(','))
          : delete draftInterface['link-aggregation'].port;
      }

      if (
        draftInterface.type === InterfaceType.LINUX_BRIDGE ||
        draftInterface.type === InterfaceType.OVS_BRIDGE
      ) {
        ensurePath(draftInterface, 'bridge.port');
        value
          ? (draftInterface.bridge.port = [{ name: value }])
          : delete draftInterface.bridge.port;
      }
    });
  };

  return (
    <FormGroup label={t('Port')} fieldId={`policy-interface-port-${id}`}>
      <Content className="policy-form-content__content-description">
        {t(
          'This allows you to specify how the ethernet interface obtains an IPv4 address—either dynamically (DHCP) or by assigning a static IP and subnet.',
        )}
      </Content>
      <TextInput
        value={
          policyInterface?.bridge?.port?.[0]?.name ||
          policyInterface?.['link-aggregation']?.port?.join(',')
        }
        type="text"
        id={`policy-interface-port-${id}`}
        onChange={(_, newValue) => onPortChange(newValue)}
      />

      {policyInterface.type === InterfaceType.BOND && (
        <FormHelperText>
          <HelperText>
            <HelperTextItem variant="default">{t('Use commas to separate ports')}</HelperTextItem>
          </HelperText>
        </FormHelperText>
      )}
    </FormGroup>
  );
};

export default PortConfiguration;
