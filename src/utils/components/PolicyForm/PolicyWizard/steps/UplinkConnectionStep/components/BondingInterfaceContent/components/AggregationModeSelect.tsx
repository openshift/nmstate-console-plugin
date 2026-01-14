import React, { FC, Ref, useState } from 'react';
import { Updater } from 'use-immer';

import { V1NodeNetworkConfigurationPolicy } from '@kubevirt-ui/kubevirt-api/nmstate';
import {
  MenuToggle,
  MenuToggleElement,
  Select,
  SelectList,
  SelectOption,
} from '@patternfly/react-core';
import ExternalLink from '@utils/components/ExternalLink/ExternalLink';
import { aggregationModes } from '@utils/components/PolicyForm/PolicyWizard/steps/UplinkConnectionStep/components/BondingInterfaceContent/utils/utils';
import { getAggregationMode } from '@utils/components/PolicyForm/PolicyWizard/utils/selectors';
import { updateBondType } from '@utils/components/PolicyForm/PolicyWizard/utils/utils';
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
      updateBondType(draftPolicy, selectedMode);
      // getLinkAggregationSettings(draftPolicy).mode =
      //   selectedMode as NodeNetworkConfigurationInterfaceBondMode;
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
      <div>
        {selectedAggregationMode && (
          <div className="pf-v6-u-mt-sm">
            <span className="pf-v6-u-mr-md">
              {aggregationModes[selectedAggregationMode]?.description}
            </span>
            <ExternalLink
              href="https://access.redhat.com/solutions/67546"
              label={t('Learn more')}
            />
          </div>
        )}
      </div>
    </>
  );
};

export default AggregationModeSelect;
