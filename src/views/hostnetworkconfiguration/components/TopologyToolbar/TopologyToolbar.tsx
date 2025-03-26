import React, { Dispatch, FC, SetStateAction } from 'react';
import { useNavigate } from 'react-router-dom-v5-compat';

import { NodeNetworkStateModelRef } from '@models';
import {
  Button,
  Title,
  Toolbar,
  ToolbarContent,
  ToolbarGroup,
  ToolbarItem,
} from '@patternfly/react-core';
import { ListIcon } from '@patternfly/react-icons';
import { useNMStateTranslation } from '@utils/hooks/useNMStateTranslation';

import TopologyToolbarFilter from './TopologyToolbarFilter';

import './TopologyToolbar.scss';

type TopologyToolbarProps = {
  selectedNodeFilters: string[];
  setSelectedNodeFilters: Dispatch<SetStateAction<string[]>>;
  nodeNames: string[];
};

const TopologyButton: FC<TopologyToolbarProps> = (props) => {
  const { t } = useNMStateTranslation();
  const navigate = useNavigate();
  const setSelectedNodeFilters = props.setSelectedNodeFilters;

  return (
    <Toolbar className="topology-toolbar" clearAllFilters={() => setSelectedNodeFilters([])}>
      <ToolbarContent className="topology-toolbar__content">
        <ToolbarGroup>
          <Title headingLevel="h2">{t('Host network configuration')}</Title>

          <Button isInline onClick={() => navigate(`/k8s/cluster/${NodeNetworkStateModelRef}`)}>
            {t('Create')}
          </Button>
          <TopologyToolbarFilter {...props} />
        </ToolbarGroup>
        <ToolbarGroup>
          <ToolbarItem className="list-view-btn">
            <Button
              icon={<ListIcon />}
              isInline
              variant="plain"
              onClick={() => navigate(`/k8s/cluster/${NodeNetworkStateModelRef}`)}
            />
          </ToolbarItem>
        </ToolbarGroup>
      </ToolbarContent>
    </Toolbar>
  );
};

export default TopologyButton;
