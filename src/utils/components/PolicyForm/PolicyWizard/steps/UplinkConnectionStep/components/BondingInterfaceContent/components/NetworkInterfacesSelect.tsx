import React, { ChangeEvent, FC, MouseEvent, Ref, useState } from 'react';
import { Updater } from 'use-immer';

import { V1NodeNetworkConfigurationPolicy } from '@kubevirt-ui/kubevirt-api/nmstate';
import {
  MenuToggle,
  MenuToggleElement,
  Select,
  SelectList,
  SelectOption,
  ValidatedOptions,
} from '@patternfly/react-core';
import FormGroupHelperText from '@utils/components/FormGroupHelperText/FormGroupHelperText';
import useNodeInterfaces from '@utils/components/PolicyForm/PolicyWizard/utils/hooks/useNodeInterfaces/useNodeInterfaces';
import { getBondPortNames } from '@utils/components/PolicyForm/PolicyWizard/utils/selectors';
import { updateBondInterfaces } from '@utils/components/PolicyForm/PolicyWizard/utils/utils';
import { useNMStateTranslation } from '@utils/hooks/useNMStateTranslation';

type NetworkInterfacesSelectProps = {
  policy: V1NodeNetworkConfigurationPolicy;
  setPolicy: Updater<V1NodeNetworkConfigurationPolicy>;
};

const NetworkInterfacesSelect: FC<NetworkInterfacesSelectProps> = ({ policy, setPolicy }) => {
  const { t } = useNMStateTranslation();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const { availableInterfaces } = useNodeInterfaces(policy?.spec?.nodeSelector);

  const selectedNetworkInterfaces = getBondPortNames(policy);

  const interfacesValidation =
    !isOpen && selectedNetworkInterfaces?.length === 1
      ? ValidatedOptions.error
      : ValidatedOptions.default;

  const onInterfaceSelect = (event: MouseEvent | ChangeEvent, selection: string) => {
    const checked = (event.target as HTMLInputElement).checked;
    setPolicy((draftPolicy) => {
      const bondPorts = getBondPortNames(draftPolicy);
      const portsToUpdate = checked
        ? [...(bondPorts || []), selection]
        : bondPorts?.filter((value) => value !== selection);

      updateBondInterfaces(draftPolicy, portsToUpdate);
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
      <FormGroupHelperText showOnError validated={interfacesValidation}>
        {t('Must have at least two interfaces.')}
      </FormGroupHelperText>
    </>
  );
};

export default NetworkInterfacesSelect;
