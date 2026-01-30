import React, {
  Dispatch,
  FC,
  MouseEvent as ReactMouseEvent,
  SetStateAction,
  useState,
} from 'react';

import { FormGroup, Select, SelectOption } from '@patternfly/react-core';

import SelectToggle from '@utils/components/Toggles/SelectToggle';
import { useNMStateTranslation } from '@utils/hooks/useNMStateTranslation';

import { NetworksSearchType } from '../utils/types';
import { getNetworkSearchLabelByType, getNetworkSearchLabels } from '../utils/utils';

type NetworksSearchTypeSelectProps = {
  selectedSearchType: NetworksSearchType;
  setSelectedSearchType: Dispatch<SetStateAction<NetworksSearchType>>;
};

const NetworksSearchTypeSelect: FC<NetworksSearchTypeSelectProps> = ({
  selectedSearchType,
  setSelectedSearchType,
}) => {
  const { t } = useNMStateTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const handleChange = (
    event?: ReactMouseEvent<Element, MouseEvent>,
    value?: NetworksSearchType,
  ) => {
    event?.preventDefault();
    if (value) {
      setSelectedSearchType(value);
      setIsOpen(false);
    }
  };

  const onToggle = () => setIsOpen((prevIsOpen) => !prevIsOpen);
  return (
    <FormGroup fieldId="type">
      <Select
        toggle={SelectToggle({
          isExpanded: isOpen,
          onClick: onToggle,
          selected: getNetworkSearchLabelByType(selectedSearchType, t),
        })}
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        onSelect={handleChange}
        selected={selectedSearchType}
      >
        {Object.entries(getNetworkSearchLabels(t)).map(([key, label]) => (
          <SelectOption key={key} value={key}>
            {label}
          </SelectOption>
        ))}
      </Select>
    </FormGroup>
  );
};

export default NetworksSearchTypeSelect;
