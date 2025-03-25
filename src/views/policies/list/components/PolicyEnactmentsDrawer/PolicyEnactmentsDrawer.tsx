import React, { FC, useEffect, useMemo, useState } from 'react';
import { useNMStateTranslation } from 'src/utils/hooks/useNMStateTranslation';
import { EnactmentStatuses } from 'src/views/policies/constants';

import { RedExclamationCircleIcon } from '@openshift-console/dynamic-plugin-sdk';
import {
  ExpandableSection,
  Icon,
  Modal,
  ModalBody,
  ModalHeader,
  Tab,
  Tabs,
  TabTitleIcon,
  TabTitleText,
  Title,
} from '@patternfly/react-core';
import { CheckIcon, CloseIcon, HourglassHalfIcon, InProgressIcon } from '@patternfly/react-icons';
import { V1beta1NodeNetworkConfigurationEnactment, V1NodeNetworkConfigurationPolicy } from '@types';

import { categorizeEnactments, findConditionType } from '../utils';

import './policy-enactments-drawer.scss';

type PolicyEnactmentsDrawerProps = {
  selectedPolicy?: V1NodeNetworkConfigurationPolicy;
  selectedState?: EnactmentStatuses;
  onClose: () => void;
  enactments: V1beta1NodeNetworkConfigurationEnactment[];
};

const PolicyEnactmentsDrawer: FC<PolicyEnactmentsDrawerProps> = ({
  selectedPolicy,
  selectedState,
  onClose,
  enactments,
}) => {
  const { t } = useNMStateTranslation();

  const {
    available: availableEnactments,
    pending: pendingEnactments,
    progressing: progressingEnactments,
    failing: failingEnactments,
    aborted: abortedEnactments,
  } = categorizeEnactments(enactments);

  const tabsData = useMemo(
    () => [
      {
        title: EnactmentStatuses.Failing,
        icon: <RedExclamationCircleIcon />,
        enactments: failingEnactments,
      },
      {
        title: EnactmentStatuses.Aborted,
        icon: (
          <Icon status="danger">
            <CloseIcon />
          </Icon>
        ),
        enactments: abortedEnactments,
      },
      {
        title: EnactmentStatuses.Available,
        icon: (
          <Icon status="success">
            <CheckIcon />
          </Icon>
        ),
        enactments: availableEnactments,
      },
      {
        title: EnactmentStatuses.Progressing,
        icon: <InProgressIcon />,
        enactments: progressingEnactments,
      },
      {
        title: EnactmentStatuses.Pending,
        icon: <HourglassHalfIcon />,
        enactments: pendingEnactments,
      },
    ],
    [enactments],
  );

  const [selectedTab, setSelectedTab] = useState<string | number>(0);

  useEffect(() => {
    setSelectedTab(tabsData.findIndex((tab) => tab.title === selectedState));
  }, [selectedPolicy, selectedState]);

  return (
    <Modal
      aria-label="Policy enactments drawer"
      className="ocs-modal co-catalog-page__overlay co-catalog-page__overlay--right policy-enactments-drawer"
      isOpen={!!selectedPolicy}
      onClose={onClose}
      disableFocusTrap
    >
      <ModalHeader title={<Title headingLevel="h2">{t('Matched nodes summary')}</Title>} />
      <ModalBody>
        <div>
          <Tabs
            activeKey={selectedTab}
            onSelect={(event, key) => setSelectedTab(key)}
            isBox
            aria-label={t('Enactments categorized by status')}
            role="region"
          >
            {tabsData.map((tabData, index) => (
              <Tab
                eventKey={index}
                key={tabData.title}
                isDisabled={tabData.enactments.length === 0}
                aria-label={t('Display all {{status}} enactments', { status: tabData.title })}
                title={
                  <>
                    <TabTitleIcon>{tabData.icon}</TabTitleIcon>
                    <TabTitleText> {t(tabData.title)} </TabTitleText>
                  </>
                }
              >
                {tabData?.enactments?.map((enhactment) => (
                  <ExpandableSection
                    toggleText={enhactment?.metadata?.name}
                    key={enhactment?.metadata?.name}
                  >
                    <pre className="policy-enactments-drawer__tabs__expandable-content">
                      {findConditionType(enhactment?.status?.conditions, tabData.title)?.message}
                    </pre>
                  </ExpandableSection>
                ))}
              </Tab>
            ))}
          </Tabs>
        </div>
      </ModalBody>
    </Modal>
  );
};

export default PolicyEnactmentsDrawer;
