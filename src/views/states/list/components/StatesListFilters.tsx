import React, { FC, useState } from 'react';

import { InterfaceType } from '@kubevirt-ui/kubevirt-api/nmstate';
import {
  MenuToggle,
  SearchInput,
  Select,
  SelectList,
  SelectOption,
  ToolbarGroup,
  ToolbarItem,
} from '@patternfly/react-core';
import { FilterIcon } from '@patternfly/react-icons';
import { useNMStateTranslation } from '@utils/hooks/useNMStateTranslation';

import { FILTER_TYPES, LLDP_DISABLED, LLDP_ENABLED } from '../constants';
import { StatesFilters } from '../hooks/useStatesFilters';

type StatesListFiltersProps = {
  filters: StatesFilters;
  onFiltersChange: (newValues: Partial<StatesFilters>) => void;
};

type FilterDefinition =
  | { kind: 'text'; id: string; title: string; placeholder: string }
  | { kind: 'checkbox'; id: string; title: string; options: { label: string; value: string }[] };

const StatesListFilters: FC<StatesListFiltersProps> = ({ filters, onFiltersChange }) => {
  const { t } = useNMStateTranslation();

  const filterDefs: FilterDefinition[] = [
    {
      kind: 'text',
      id: FILTER_TYPES.IP_ADDRESS,
      title: t('IP address'),
      placeholder: t('Search by IP address...'),
    },
    {
      kind: 'text',
      id: FILTER_TYPES.MAC_ADDRESS,
      title: t('MAC address'),
      placeholder: t('Search by MAC address...'),
    },
    {
      kind: 'text',
      id: FILTER_TYPES.LLDP_NAME,
      title: t('LLDP VLAN name'),
      placeholder: t('Search by VLAN name...'),
    },
    {
      kind: 'text',
      id: FILTER_TYPES.LLDP_SYSTEM_NAME,
      title: t('LLDP system name'),
      placeholder: t('Search by LLDP system name...'),
    },
    {
      kind: 'text',
      id: FILTER_TYPES.NODE_LABEL,
      title: t('Node label'),
      placeholder: t('Search by node label (e.g. key=value)...'),
    },
    {
      kind: 'checkbox',
      id: FILTER_TYPES.LLDP,
      title: t('LLDP'),
      options: [
        { label: t('Enabled'), value: LLDP_ENABLED },
        { label: t('Disabled'), value: LLDP_DISABLED },
      ],
    },
    {
      kind: 'checkbox',
      id: FILTER_TYPES.INTERFACE_STATE,
      title: t('Interface state'),
      options: [
        { label: t('Up'), value: 'up' },
        { label: t('Down'), value: 'down' },
      ],
    },
    {
      kind: 'checkbox',
      id: FILTER_TYPES.INTERFACE_TYPE,
      title: t('Interface type'),
      options: [
        InterfaceType.OVS_BRIDGE,
        InterfaceType.OVS_INTERFACE,
        InterfaceType.BOND,
        InterfaceType.ETHERNET,
        InterfaceType.LINUX_BRIDGE,
      ].map((type) => ({ label: type, value: type })),
    },
    {
      kind: 'checkbox',
      id: FILTER_TYPES.IP_FILTER,
      title: t('IP'),
      options: [
        { label: t('IPv4'), value: 'ipv4' },
        { label: t('IPv6'), value: 'ipv6' },
      ],
    },
  ];

  const [activeFilterId, setActiveFilterId] = useState(filterDefs[0].id);
  const [attributeMenuOpen, setAttributeMenuOpen] = useState(false);
  const [checkboxMenuOpen, setCheckboxMenuOpen] = useState(false);

  const activeFilter = filterDefs.find((f) => f.id === activeFilterId) ?? filterDefs[0];

  const onCheckboxSelect = (value: string) => {
    const current = filters[activeFilterId] as string[];
    const next = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    onFiltersChange({ [activeFilterId]: next });
  };

  return (
    <ToolbarGroup variant="filter-group">
      <ToolbarItem>
        <Select
          isOpen={attributeMenuOpen}
          onOpenChange={setAttributeMenuOpen}
          toggle={(ref) => (
            <MenuToggle ref={ref} icon={<FilterIcon />} onClick={() => setAttributeMenuOpen((o) => !o)} isExpanded={attributeMenuOpen}>
              {activeFilter.title}
            </MenuToggle>
          )}
          onSelect={(_e, value) => {
            setActiveFilterId(value as string);
            setAttributeMenuOpen(false);
          }}
          selected={activeFilterId}
        >
          <SelectList>
            {filterDefs.map((f) => (
              <SelectOption key={f.id} value={f.id}>
                {f.title}
              </SelectOption>
            ))}
          </SelectList>
        </Select>
      </ToolbarItem>

      <ToolbarItem>
        {activeFilter.kind === 'text' ? (
          <SearchInput
            placeholder={activeFilter.placeholder}
            value={filters[activeFilterId] as string}
            onChange={(_e, val) => onFiltersChange({ [activeFilterId]: val })}
            onClear={() => onFiltersChange({ [activeFilterId]: '' })}
          />
        ) : (
          <Select
            isOpen={checkboxMenuOpen}
            onOpenChange={setCheckboxMenuOpen}
            toggle={(ref) => (
              <MenuToggle
                ref={ref}
                onClick={() => setCheckboxMenuOpen((o) => !o)}
                isExpanded={checkboxMenuOpen}
                badge={(filters[activeFilterId] as string[]).length || undefined}
              >
                {activeFilter.title}
              </MenuToggle>
            )}
            onSelect={(_e, value) => onCheckboxSelect(value as string)}
          >
            <SelectList>
              {activeFilter.options.map((opt) => (
                <SelectOption
                  key={opt.value}
                  value={opt.value}
                  hasCheckbox
                  isSelected={(filters[activeFilterId] as string[]).includes(opt.value)}
                >
                  {opt.label}
                </SelectOption>
              ))}
            </SelectList>
          </Select>
        )}
      </ToolbarItem>
    </ToolbarGroup>
  );
};

export default StatesListFilters;
