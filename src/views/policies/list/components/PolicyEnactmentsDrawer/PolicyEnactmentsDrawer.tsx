import React, { FC, useEffect, useMemo, useState } from 'react';
import { useNMStateTranslation } from 'src/utils/hooks/useNMStateTranslation';
import { EnactmentStatuses } from 'src/views/policies/constants';

import {
  V1beta1NodeNetworkConfigurationEnactment,
  V1NodeNetworkConfigurationPolicy,
} from '@kubevirt-ui-ext/kubevirt-api/nmstate';
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
} from '@patternfly/react-core';
import { CheckIcon, CloseIcon, HourglassHalfIcon, InProgressIcon } from '@patternfly/react-icons';
import { categorizeEnactments } from '@utils/resources/enactments/utils';

import { findConditionType } from '../utils';

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

  // constant part of the tabs data
  const tabsTitleWithIcon = useMemo(
    () => [
      {
        title: EnactmentStatuses.Failing,
        icon: <RedExclamationCircleIcon />,
      },
      {
        title: EnactmentStatuses.Aborted,
        icon: (
          <Icon status="danger">
            <CloseIcon />
          </Icon>
        ),
      },
      {
        title: EnactmentStatuses.Available,
        icon: (
          <Icon status="success">
            <CheckIcon />
          </Icon>
        ),
      },
      {
        title: EnactmentStatuses.Progressing,
        icon: <InProgressIcon />,
      },
      {
        title: EnactmentStatuses.Pending,
        icon: <HourglassHalfIcon />,
      },
    ],
    [],
  );

  // tabs data derive order from constant part
  const tabsData = useMemo(() => {
    const {
      available: availableEnactments,
      pending: pendingEnactments,
      progressing: progressingEnactments,
      failing: failingEnactments,
      aborted: abortedEnactments,
    } = categorizeEnactments(enactments);
    const title2enactment = {
      [EnactmentStatuses.Failing]: failingEnactments,
      [EnactmentStatuses.Aborted]: abortedEnactments,
      [EnactmentStatuses.Available]: availableEnactments,
      [EnactmentStatuses.Progressing]: progressingEnactments,
      [EnactmentStatuses.Pending]: pendingEnactments,
    };
    return tabsTitleWithIcon.map((tab) => ({
      ...tab,
      enactments: title2enactment[tab.title],
    }));
  }, [tabsTitleWithIcon, enactments]);

  const [selectedTab, setSelectedTab] = useState<string | number>(0);

  useEffect(() => {
    setSelectedTab(tabsTitleWithIcon.findIndex((tab) => tab.title === selectedState));
  }, [selectedPolicy, selectedState, tabsTitleWithIcon]);

  return (
    <Modal
      aria-label="Policy enactments drawer"
      className="ocs-modal co-catalog-page__overlay co-catalog-page__overlay--right policy-enactments-drawer"
      isOpen={!!selectedPolicy}
      onClose={onClose}
      disableFocusTrap
    >
      <ModalHeader title={t('Matched nodes summary')} />
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
