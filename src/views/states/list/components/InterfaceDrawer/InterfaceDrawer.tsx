import React, { FC } from 'react';
import { useLocation } from 'react-router-dom-v5-compat';

import {
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  PageSection,
  Tab,
  Tabs as TabsComponent,
  TabTitleText,
} from '@patternfly/react-core';
import { NodeNetworkConfigurationInterface } from '@types';
import { useNMStateTranslation } from '@utils/hooks/useNMStateTranslation';

import { InterfaceDrawerTabId, InterfaceDrawerTabProps } from './constants';
import InterfaceDrawerDetailsTab from './InterfaceDrawerDetailsTab';
import InterfaceDrawerYAMLFooter from './InterfaceDrawerFooter';
import InterfaceDrawerYAMLTab from './InterfaceDrawerYAMLTab';

type InterfaceDrawerProps = {
  selectedInterface: NodeNetworkConfigurationInterface;
  onClose: () => void;
};

const InterfaceDrawer: FC<InterfaceDrawerProps> = ({ selectedInterface, onClose }) => {
  const { t } = useNMStateTranslation();

  const location = useLocation();

  const Tabs: InterfaceDrawerTabProps[] = [
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

  const selectedTabId = (location.hash.replace('#', '') as InterfaceDrawerTabId) || Tabs?.[0]?.id;

  const SelectedTabComponent =
    Tabs.find((tab) => tab.id === selectedTabId)?.component ?? Tabs?.[0]?.component;

  return (
    <Modal
      isOpen={!!selectedInterface}
      onClose={onClose}
      disableFocusTrap
      data-test="interface-drawer"
    >
      <ModalHeader title={selectedInterface?.name} />
      <ModalBody>
        <div>
          <TabsComponent activeKey={selectedTabId}>
            {Tabs.map((tab) => (
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
        <PageSection className="pf-v6-u-mt-md">
          <SelectedTabComponent selectedInterface={selectedInterface} />
        </PageSection>
      </ModalBody>
      {selectedTabId === 'drawer-yaml' && (
        <ModalFooter>
          <InterfaceDrawerYAMLFooter selectedInterface={selectedInterface} />
        </ModalFooter>
      )}
    </Modal>
  );
};

export default InterfaceDrawer;
