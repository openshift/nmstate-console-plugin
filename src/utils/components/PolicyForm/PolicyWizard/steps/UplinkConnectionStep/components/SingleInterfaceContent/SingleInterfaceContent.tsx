import React, { FC } from 'react';
import { Updater } from 'use-immer';

import { V1NodeNetworkConfigurationPolicy } from '@kubevirt-ui/kubevirt-api/nmstate';
import { FormGroup, Label } from '@patternfly/react-core';
import TextWithHelpIcon from '@utils/components/HelpTextIcon/TextWithHelpIcon';
import IPAddressAlert from '@utils/components/PolicyForm/PolicyWizard/steps/UplinkConnectionStep/components/SingleInterfaceContent/components/IPAddressAlert';
import { DEFAULT_OVS_INTERFACE_NAME } from '@utils/components/PolicyForm/PolicyWizard/utils/constants';
import { NodeInterfacesData } from '@utils/components/PolicyForm/PolicyWizard/utils/hooks/useNodeInterfaces/utils/types';
import { getBridgePorts } from '@utils/components/PolicyForm/PolicyWizard/utils/selectors';
import SelectTypeahead from '@utils/components/SelectTypeahead/SelectTypeahead';
import { useNMStateTranslation } from '@utils/hooks/useNMStateTranslation';
import { getIPV4Address, getIPV6Address } from '@utils/resources/interfaces/getters';

import './SingleInterfaceContent.scss';

type SingleInterfaceContentProps = {
  nodeInterfacesData: NodeInterfacesData;
  policy: V1NodeNetworkConfigurationPolicy;
  setPolicy: Updater<V1NodeNetworkConfigurationPolicy>;
  showContent: boolean;
};

const SingleInterfaceContent: FC<SingleInterfaceContentProps> = ({
  nodeInterfacesData,
  policy,
  setPolicy,
  showContent,
}) => {
  const { t } = useNMStateTranslation();
  const { availableInterfaces } = nodeInterfacesData;

  const options = availableInterfaces?.map((iface) => ({
    children: <Label isCompact>{iface.name}</Label>,
    key: iface.name,
    type: 'ethernet1',
    value: iface.name,
  }));

  if (!showContent) return null;

  const selectedInterfaceName =
    getBridgePorts(policy)?.filter((iface) => iface.name !== DEFAULT_OVS_INTERFACE_NAME)?.[0]
      ?.name || '';

  const selectedInterface = availableInterfaces?.find(
    (iface) => iface.name === selectedInterfaceName,
  );
  const selectedInterfaceHasIPAddresses =
    !!getIPV4Address(selectedInterface) || !!getIPV6Address(selectedInterface);

  return (
    <div className="single-interface-content">
      <FormGroup
        className="single-interface-content__ethernet-form-group"
        label={
          <TextWithHelpIcon
            helpBodyContent={t('Unused network interfaces available on all of the selected nodes')}
            helpHeaderContent={t('Network interface')}
            text={t('Network interface')}
          />
        }
        isRequired
        fieldId="ethernet-name-group"
      >
        <SelectTypeahead
          dataTestId="ethernet-name"
          initialOptions={options}
          isFullWidth
          placeholder={t('Search and select from the list')}
          selected={selectedInterfaceName}
          setSelected={(selectedIfaceName) =>
            setPolicy((draftPolicy) => {
              draftPolicy.spec.desiredState.interfaces[0].bridge.port = [
                { name: selectedIfaceName },
                { name: DEFAULT_OVS_INTERFACE_NAME },
              ];
            })
          }
        />
      </FormGroup>
      <div className="pf-v6-u-font-size-xs">
        {t(
          'To avoid breaking the default node network ensure the selected interface is free, properly connected to a switch, and not used by another node network.',
        )}
        {selectedInterfaceHasIPAddresses && <IPAddressAlert />}
      </div>
    </div>
  );
};

export default SingleInterfaceContent;
