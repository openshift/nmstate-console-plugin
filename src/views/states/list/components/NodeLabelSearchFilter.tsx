import React, { FC, FormEvent, useMemo, useRef, useState } from 'react';

import {
  Menu,
  MenuContent,
  MenuItem,
  MenuList,
  SearchInput,
  ToolbarFilter,
  ToolbarFilterProps,
} from '@patternfly/react-core';
import { useNMStateTranslation } from '@utils/hooks/useNMStateTranslation';

import useNodeLabelSuggestions from './useNodeLabelSuggestions';

const MAX_SUGGESTIONS = 10;

type NodeLabelSearchFilterProps = {
  filterId: string;
  title: string;
  showToolbarItem?: ToolbarFilterProps['showToolbarItem'];
  values: string[];
  onAdd: (label: string) => void;
  onRemove: (label: string) => void;
  onClearAll: () => void;
};

const NodeLabelSearchFilter: FC<NodeLabelSearchFilterProps> = ({
  filterId,
  title,
  showToolbarItem,
  values,
  onAdd,
  onRemove,
  onClearAll,
}) => {
  const suggestions = useNodeLabelSuggestions();
  const { t } = useNMStateTranslation();
  const containerRef = useRef<HTMLDivElement>(null);

  const [inputValue, setInputValue] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const filteredSuggestions = useMemo(() => {
    if (!inputValue) return [];
    const lower = inputValue.toLowerCase();
    return suggestions
      .filter((s) => !values.includes(s) && s.toLowerCase().includes(lower))
      .slice(0, MAX_SUGGESTIONS);
  }, [inputValue, suggestions, values]);

  const handleInputChange = (_e: FormEvent<HTMLInputElement>, val: string) => {
    setInputValue(val);
    setIsMenuOpen(!!val);
  };

  const handleSuggestionClick = (suggestion: string) => {
    onAdd(suggestion);
    setInputValue('');
    setIsMenuOpen(false);
  };

  const handleInputClear = () => {
    setInputValue('');
    setIsMenuOpen(false);
  };

  return (
    <ToolbarFilter
      id="node-label-search-filter"
      data-ouia-component-id="node-label-search-filter"
      labels={values}
      deleteLabel={(_category, label) => onRemove(label as string)}
      deleteLabelGroup={() => onClearAll()}
      categoryName={title}
      showToolbarItem={showToolbarItem}
    >
      <div
        ref={containerRef}
        style={{ position: 'relative' }}
        onBlur={(e) => {
          if (!containerRef?.current?.contains(e.relatedTarget as Node)) {
            setIsMenuOpen(false);
          }
        }}
      >
        <SearchInput
          searchInputId={filterId}
          value={inputValue}
          placeholder={t('Search by node label (e.g. key=value)...')}
          onChange={handleInputChange}
          onClear={handleInputClear}
        />
        {isMenuOpen && filteredSuggestions.length > 0 && (
          <div
            style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              zIndex: 200,
              width: '100%',
              minWidth: 'max-content',
            }}
          >
            <Menu isScrollable>
              <MenuContent>
                <MenuList>
                  {filteredSuggestions.map((suggestion) => (
                    <MenuItem key={suggestion} onClick={() => handleSuggestionClick(suggestion)}>
                      {suggestion}
                    </MenuItem>
                  ))}
                </MenuList>
              </MenuContent>
            </Menu>
          </div>
        )}
      </div>
    </ToolbarFilter>
  );
};

export default NodeLabelSearchFilter;
