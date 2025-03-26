import React, { FC } from 'react';

import {
  PageSection,
  Title,
  Tabs as TabsComponent,
  Tab,
  TabTitleText,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
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
      aria-label="Interface drawer"
      className="ocs-modal co-catalog-page__overlay co-catalog-page__overlay--right interface-drawer"
      isOpen={!!selectedInterface}
      onClose={onClose}
      disableFocusTrap
      data-test="interface-drawer"
    >
      <ModalHeader title={<Title headingLevel="h2">{selectedInterface?.name}</Title>} />
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
