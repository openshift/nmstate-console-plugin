import React, { FC, useMemo } from 'react';
import { useLocation } from 'react-router-dom-v5-compat';
import PolicyDetailsPage from 'src/views/policies/details/PolicyDetailsPage';
import PolicyPageTitle from 'src/views/policies/details/PolicyPageTitle';
import PolicyYAMLPage from 'src/views/policies/details/PolicyYamlPage';

import { Tab, Tabs as TabsComponent, TabTitleText } from '@patternfly/react-core';
import {
  NodeNetworkConfigurationInterface,
  V1beta1NodeNetworkConfigurationPolicy,
  V1NodeNetworkConfigurationPolicy,
} from '@types';
import { useNMStateTranslation } from '@utils/hooks/useNMStateTranslation';

import './policy-drawer.scss';

type PolicyDrawerProps = {
  selectedPolicy: V1beta1NodeNetworkConfigurationPolicy;
  selectedInterface: NodeNetworkConfigurationInterface;
};

const PolicyDrawer: FC<PolicyDrawerProps> = ({ selectedPolicy, selectedInterface }) => {
  const { t } = useNMStateTranslation();
  const location = useLocation();

  const tabs = useMemo(
    () => [
      {
        id: 'details',
        title: t('Details'),
        component: PolicyDetailsPage,
      },
      {
        id: 'yaml',
        title: t('YAML'),
        component: PolicyYAMLPage,
      },
    ],
    [t],
  );

  const selectedTabId = location.hash.replace('#', '') || tabs?.[0]?.id;

  const SelectedTabComponent: FC<{
    obj: V1NodeNetworkConfigurationPolicy;
    iface?: NodeNetworkConfigurationInterface;
  }> = tabs.find((tab) => tab.id === selectedTabId)?.component ?? tabs?.[0]?.component;

  return (
    <div>
      <PolicyPageTitle policy={selectedPolicy} name={selectedPolicy?.metadata?.name} />
      <div className="pf-v6-u-ml-md">
        <TabsComponent activeKey={selectedTabId}>
          {tabs.map((tab) => (
            <Tab
              key={tab.id}
              title={<TabTitleText>{tab.title}</TabTitleText>}
              eventKey={tab.id}
              data-test-id="horizontal-link-Details"
              href={`${location.pathname}${location.search}#${tab.id}`}
            />
          ))}
        </TabsComponent>
      </div>
      <SelectedTabComponent obj={selectedPolicy} iface={selectedInterface} />
    </div>
  );
};

export default PolicyDrawer;
