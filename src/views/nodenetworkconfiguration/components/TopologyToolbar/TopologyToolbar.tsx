import React, { Dispatch, FC, SetStateAction } from 'react';
import { useHistory } from 'react-router';
import { useNavigate } from 'react-router-dom-v5-compat';
import NodeNetworkConfigurationPolicyModel from 'src/console-models/NodeNetworkConfigurationPolicyModel';

import { NodeNetworkConfigurationPolicyModelRef, NodeNetworkStateModelRef } from '@models';
import { ListPageCreateDropdown } from '@openshift-console/dynamic-plugin-sdk';
import {
  Button,
  Title,
  Toolbar,
  ToolbarContent,
  ToolbarGroup,
  ToolbarItem,
} from '@patternfly/react-core';
import { ListIcon } from '@patternfly/react-icons';
import { getResourceUrl } from '@utils/helpers';
import { useNMStateTranslation } from '@utils/hooks/useNMStateTranslation';

import { CREATE_POLICY_QUERY_PARAM } from '../TopologySidebar/constants';

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
  const history = useHistory();

  const createItems = {
    form: t('From Form'),
    yaml: t('With YAML'),
  };

  const onCreate = (type: string) => {
    const baseURL = getResourceUrl({
      model: NodeNetworkConfigurationPolicyModel,
    });

    const newParams = new URLSearchParams({ [CREATE_POLICY_QUERY_PARAM]: 'true' });

    return type === 'form'
      ? history.push({ search: newParams.toString() })
      : history.push(`${baseURL}~new`);
  };

  return (
    <Toolbar className="topology-toolbar" clearAllFilters={() => setSelectedNodeFilters([])}>
      <ToolbarContent className="topology-toolbar__content">
        <ToolbarGroup>
          <Title headingLevel="h2">{t('Node network configuration')}</Title>
          <ListPageCreateDropdown
            items={createItems}
            onClick={onCreate}
            createAccessReview={{
              groupVersionKind: NodeNetworkConfigurationPolicyModelRef,
            }}
          >
            {t('Create')}
          </ListPageCreateDropdown>
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
