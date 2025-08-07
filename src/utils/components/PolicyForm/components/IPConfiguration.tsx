import React, { FC } from 'react';

import {
  AUTO_DNS,
  AUTO_GATEWAY,
  AUTO_ROUTES,
  NodeNetworkConfigurationInterface,
} from '@kubevirt-ui/kubevirt-api/nmstate';
import {
  Checkbox,
  Content,
  Flex,
  FlexItem,
  FormGroup,
  NumberInput,
  Radio,
  TextInput,
} from '@patternfly/react-core';
import { useNMStateTranslation } from '@utils/hooks/useNMStateTranslation';

import { DEFAULT_PREFIX_LENGTH, onInterfaceChangeType } from '../utils/constants';

type IPConfigurationProps = {
  policyInterface?: NodeNetworkConfigurationInterface;
  onInterfaceChange?: (updateInterface: onInterfaceChangeType) => void;
  id: number | string;
};

const IPConfiguration: FC<IPConfigurationProps> = ({ policyInterface, onInterfaceChange, id }) => {
  const { t } = useNMStateTranslation();

  const onIP4Change = (checked: boolean) => {
    if (checked)
      onInterfaceChange(
        (draftInterface) =>
          (draftInterface.ipv4 = {
            enabled: true,
            address: [{ ip: '', 'prefix-length': DEFAULT_PREFIX_LENGTH }],
          }),
      );
    else {
      onInterfaceChange((draftInterface) => {
        delete draftInterface.ipv4;
      });
    }
  };

  const onDHCPChange = (checked: boolean) => {
    onInterfaceChange((draftInterface) => {
      draftInterface.ipv4 = { enabled: true, dhcp: checked };
    });
  };

  const onAddressChange = (value: string) => {
    onInterfaceChange((draftInterface) => {
      draftInterface.ipv4 = {
        enabled: true,
        address: [{ ip: value, 'prefix-length': DEFAULT_PREFIX_LENGTH }],
      };
    });
  };

  const onPrefixChange = (value: number) => {
    onInterfaceChange((draftInterface) => {
      if (draftInterface.ipv4.address.length > 0)
        draftInterface.ipv4.address[0]['prefix-length'] = value;
    });
  };

  const autoDNS = policyInterface?.ipv4?.[AUTO_DNS];
  const autoRoutes = policyInterface?.ipv4?.[AUTO_ROUTES];
  const autoGateway = policyInterface?.ipv4?.[AUTO_GATEWAY];

  return (
    <FormGroup label={t('IP configuration')} fieldId={`policy-interface-ip-${id}`}>
      <Content className="policy-form-content__content-description">
        {t(
          'This allows you to specify how the ethernet interface obtains an IPv4 address—either dynamically (DHCP) or by assigning a static IP and subnet.',
        )}
      </Content>
      <Checkbox
        label={t('IPv4')}
        id={`policy-interface-ip-${id}`}
        isChecked={policyInterface?.ipv4?.enabled}
        onChange={(_, newValue) => onIP4Change(newValue)}
      />
      <div className="pf-v6-u-ml-md pf-v6-u-mt-sm">
        {policyInterface?.ipv4 && (
          <Flex className="pf-v6-u-mb-md">
            <FlexItem>
              <Radio
                label={t('IP address')}
                name={`ip-or-dhcp-${id}`}
                id={`ip-${id}`}
                isChecked={!policyInterface?.ipv4?.dhcp}
                onChange={() => onAddressChange('')}
              />
            </FlexItem>

            <FlexItem>
              <Radio
                label={t('DHCP')}
                name={`ip-or-dhcp-${id}`}
                id={`dhcp-${id}`}
                isChecked={policyInterface?.ipv4?.dhcp}
                onChange={(_, newValue) => onDHCPChange(newValue)}
              />
            </FlexItem>
          </Flex>
        )}
        {policyInterface?.ipv4 && !policyInterface?.ipv4?.dhcp && (
          <>
            <FormGroup
              label={t('IPV4 address')}
              isRequired
              fieldId={`ipv4-address-${id}`}
              className="pf-v6-u-mb-md"
            >
              <TextInput
                value={policyInterface?.ipv4?.address?.[0]?.ip}
                type="text"
                id={`ipv4-address-${id}`}
                onChange={(_, newValue) => onAddressChange(newValue)}
              />
            </FormGroup>
            <FormGroup label={t('Prefix length')} isRequired fieldId={`prefix-length-${id}`}>
              <NumberInput
                value={policyInterface?.ipv4?.address?.[0]?.['prefix-length']}
                id={`prefix-length-${id}`}
                onChange={(event) => onPrefixChange(event.currentTarget.valueAsNumber)}
                onMinus={() => onPrefixChange(policyInterface.ipv4.address[0]['prefix-length'] - 1)}
                onPlus={() => onPrefixChange(policyInterface.ipv4.address[0]['prefix-length'] + 1)}
                min={0}
                max={32}
              />
            </FormGroup>
          </>
        )}

        {!!policyInterface?.ipv4?.dhcp && (
          <>
            <Checkbox
              label={t('Auto-DNS')}
              id={`policy-interface-dns-${id}`}
              isChecked={autoDNS === true || autoDNS === undefined}
              onChange={(_, checked) =>
                onInterfaceChange((draftInterface) => (draftInterface.ipv4[AUTO_DNS] = checked))
              }
            />
            <Checkbox
              label={t('Auto-routes')}
              id={`policy-interface-routes-${id}`}
              isChecked={autoRoutes === true || autoRoutes === undefined}
              onChange={(_, checked) =>
                onInterfaceChange((draftInterface) => (draftInterface.ipv4[AUTO_ROUTES] = checked))
              }
            />
            <Checkbox
              label={t('Auto-gateway')}
              id={`policy-interface-gateway-${id}`}
              isChecked={autoGateway === true || autoGateway === undefined}
              onChange={(_, checked) =>
                onInterfaceChange((draftInterface) => (draftInterface.ipv4[AUTO_GATEWAY] = checked))
              }
            />
          </>
        )}
      </div>
    </FormGroup>
  );
};

export default IPConfiguration;
