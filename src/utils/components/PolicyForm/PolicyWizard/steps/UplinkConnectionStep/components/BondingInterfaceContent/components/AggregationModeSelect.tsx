import React, { FC, Ref, useMemo, useState } from 'react';
import { Updater } from 'use-immer';

import {
  MenuToggle,
  MenuToggleElement,
  Select,
  SelectList,
  SelectOption,
} from '@patternfly/react-core';
import { V1NodeNetworkConfigurationPolicy } from '@types';
import { aggregationModes } from '@utils/components/PolicyForm/PolicyWizard/steps/UplinkConnectionStep/components/BondingInterfaceContent/utils/utils';
import { LINK_AGGREGATION } from '@utils/components/PolicyForm/PolicyWizard/utils/constants';
import {
  getAggregationMode,
  getPolicyInterface,
} from '@utils/components/PolicyForm/PolicyWizard/utils/utils';
import { isEmpty } from '@utils/helpers';
import { useNMStateTranslation } from '@utils/hooks/useNMStateTranslation';

type AggregationModeSelectProps = {
  policy: V1NodeNetworkConfigurationPolicy;
  setPolicy: Updater<V1NodeNetworkConfigurationPolicy>;
};

const AggregationModeSelect: FC<AggregationModeSelectProps> = ({ policy, setPolicy }) => {
  const { t } = useNMStateTranslation();
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const selectedAggregationMode = getAggregationMode(policy);

  const handleAggregationModeChange = (_, selectedMode: string) => {
    setPolicy((draftPolicy) => {
      getPolicyInterface(draftPolicy)[LINK_AGGREGATION].mode = selectedMode;
    });
    setIsOpen(false);
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
            {isEmpty(selectedAggregationMode)
              ? t('Select from the list')
              : aggregationModes[selectedAggregationMode]?.label}
          </MenuToggle>
        )}
        onSelect={handleAggregationModeChange}
        selected={selectedAggregationMode}
        isOpen={isOpen}
        onOpenChange={(isOpen) => setIsOpen(isOpen)}
      >
        <SelectList>
          {Object.entries(aggregationModes).map(([name, mode]) => (
            <SelectOption
              description={mode.description}
              key={name}
              value={name}
              isSelected={selectedAggregationMode === name}
            >
              {mode.label}
            </SelectOption>
          ))}
        </SelectList>
      </Select>
    </>
  );
};

export default AggregationModeSelect;
