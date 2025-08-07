import React, { ChangeEvent, FC, MouseEvent, Ref, useState } from 'react';
import { Updater } from 'use-immer';

import {
  MenuToggle,
  MenuToggleElement,
  Select,
  SelectList,
  SelectOption,
  ValidatedOptions,
} from '@patternfly/react-core';
import { V1NodeNetworkConfigurationPolicy } from '@types';
import FormGroupHelperText from '@utils/components/FormGroupHelperText/FormGroupHelperText';
import { LINK_AGGREGATION } from '@utils/components/PolicyForm/PolicyWizard/utils/constants';
import useNodeInterfaces from '@utils/components/PolicyForm/PolicyWizard/utils/hooks/useNodeInterfaces/useNodeInterfaces';
import {
  getAggregationPorts,
  getPolicyInterface,
} from '@utils/components/PolicyForm/PolicyWizard/utils/utils';
import { useNMStateTranslation } from '@utils/hooks/useNMStateTranslation';

type NetworkInterfacesSelectProps = {
  policy: V1NodeNetworkConfigurationPolicy;
  setPolicy: Updater<V1NodeNetworkConfigurationPolicy>;
};

const NetworkInterfacesSelect: FC<NetworkInterfacesSelectProps> = ({ policy, setPolicy }) => {
  const { t } = useNMStateTranslation();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const { availableInterfaces } = useNodeInterfaces(policy?.spec?.nodeSelector);

  const selectedNetworkInterfaces = getAggregationPorts(policy);

  const interfacesValidation =
    !isOpen && selectedNetworkInterfaces?.length === 1
      ? ValidatedOptions.error
      : ValidatedOptions.default;

  const onInterfaceSelect = (event: MouseEvent | ChangeEvent, selection: string) => {
    const checked = (event.target as HTMLInputElement).checked;
    setPolicy((draftPolicy) => {
      const ports = getAggregationPorts(policy);

      getPolicyInterface(draftPolicy)[LINK_AGGREGATION].port = checked
        ? [...ports, selection]
        : ports.filter((value) => value !== selection);
    });
  };

  return (
    <>
      <Select
        role="menu"
        toggle={(toggleRef: Ref<MenuToggleElement>) => (
          <MenuToggle
            ref={toggleRef}
            onClick={() => setIsOpen(!isOpen)}
            isExpanded={isOpen}
            isFullWidth
          >
            {t('Search and select from the list. Multiple options can be selected.')}
          </MenuToggle>
        )}
        onSelect={onInterfaceSelect}
        selected={selectedNetworkInterfaces}
        isOpen={isOpen}
        onOpenChange={(isOpen) => setIsOpen(isOpen)}
      >
        <SelectList>
          {availableInterfaces.map((iface) => (
            <SelectOption
              hasCheckbox
              key={iface.name}
              value={iface.name}
              isSelected={selectedNetworkInterfaces.includes(iface.name)}
            >
              {iface.name}
            </SelectOption>
          ))}
        </SelectList>
      </Select>
      <FormGroupHelperText validated={interfacesValidation}>
        {t('Must have at least two interfaces.')}
      </FormGroupHelperText>
    </>
  );
};

export default NetworkInterfacesSelect;
