import React, { FC } from 'react';
import { NodeNetworkConfigurationInterfaceBondMode } from 'src/nmstate-types/custom-models/NodeNetworkConfigurationInterfaceBondMode';

import { FormGroup, FormSelect, FormSelectOption, FormSelectProps } from '@patternfly/react-core';
import { NodeNetworkConfigurationInterface } from '@types';
import { ensurePath } from '@utils/helpers';
import { useNMStateTranslation } from '@utils/hooks/useNMStateTranslation';

import { onInterfaceChangeType } from '../constants';

import BondOptions from './BondOptions';
import CopyMAC from './CopyMAC';

type HandleSelectChange = FormSelectProps['onChange'];

type BondConfigurationProps = {
  policyInterface?: NodeNetworkConfigurationInterface;
  onInterfaceChange?: (updateInterface: onInterfaceChangeType) => void;
  id: number | string;
};

const BondConfiguration: FC<BondConfigurationProps> = ({
  policyInterface,
  onInterfaceChange,
  id,
}) => {
  const { t } = useNMStateTranslation();

  const handleAggregationChange: HandleSelectChange = (event, aggregationMode: string) => {
    onInterfaceChange((draftInterface) => {
      ensurePath(draftInterface, 'link-aggregation');
      draftInterface['link-aggregation'].mode =
        aggregationMode as NodeNetworkConfigurationInterfaceBondMode;
    });
  };

  return (
    <>
      <CopyMAC id={id} onInterfaceChange={onInterfaceChange} policyInterface={policyInterface} />
      <FormGroup
        label={t('Aggregation mode')}
        isRequired
        fieldId={`policy-interface-aggregation-${id}`}
      >
        <FormSelect
          id={`policy-interface-aggregation-${id}`}
          onChange={handleAggregationChange}
          value={policyInterface?.['link-aggregation']?.mode}
        >
          {Object.entries(NodeNetworkConfigurationInterfaceBondMode).map(([key, value]) => (
            <FormSelectOption key={key} value={value} label={value} />
          ))}
        </FormSelect>
      </FormGroup>
      <BondOptions
        onInterfaceChange={onInterfaceChange}
        policyInterface={policyInterface}
        id={id}
      />
    </>
  );
};

export default BondConfiguration;
