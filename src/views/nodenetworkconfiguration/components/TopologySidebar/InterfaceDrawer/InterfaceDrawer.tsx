import React, { FC } from 'react';
import { useLocation } from 'react-router-dom-v5-compat';

import { NodeNetworkConfigurationInterface } from '@kubevirt-ui/kubevirt-api/nmstate';
import {
  PageSection,
  Tab,
  Tabs as TabsComponent,
  TabTitleText,
  Title,
} from '@patternfly/react-core';
import { useNMStateTranslation } from '@utils/hooks/useNMStateTranslation';

import { InterfaceDrawerTabId, InterfaceDrawerTabProps } from './constants';
import InterfaceDrawerDetailsTab from './InterfaceDrawerDetailsTab';
import InterfaceDrawerYAMLFooter from './InterfaceDrawerFooter';
import InterfaceDrawerYAMLTab from './InterfaceDrawerYAMLTab';

type InterfaceDrawerProps = {
  selectedInterface: NodeNetworkConfigurationInterface;
};

const InterfaceDrawer: FC<InterfaceDrawerProps> = ({ selectedInterface }) => {
  const { t } = useNMStateTranslation();

  const location = useLocation();

  const tabs: InterfaceDrawerTabProps[] = [
    {
      title: t('Details'),
      id: 'drawer-details',
      component: InterfaceDrawerDetailsTab,
    },
    {
      title: t('YAML'),
      id: 'drawer-yaml',
      component: InterfaceDrawerYAMLTab,
    },
  ];

  const selectedTabId = (location.hash.replace('#', '') as InterfaceDrawerTabId) || tabs?.[0]?.id;

  const SelectedTabComponent =
    tabs.find((tab) => tab.id === selectedTabId)?.component ?? tabs?.[0]?.component;

  return (
    <div>
      <PageSection>
        <Title headingLevel="h1">{selectedInterface?.name}</Title>
      </PageSection>
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
      <PageSection>
        <SelectedTabComponent selectedInterface={selectedInterface} />
      </PageSection>

      {selectedTabId === 'drawer-yaml' && (
        <InterfaceDrawerYAMLFooter selectedInterface={selectedInterface} />
      )}
    </div>
  );
};

export default InterfaceDrawer;
