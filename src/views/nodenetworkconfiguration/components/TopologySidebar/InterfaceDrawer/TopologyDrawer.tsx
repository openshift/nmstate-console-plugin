import React, { FC, ReactNode, useState } from 'react';
import { useNavigate } from 'react-router-dom-v5-compat';
import { useLocation } from 'react-router-dom-v5-compat';
import { useNMStateTranslation } from 'src/utils/hooks/useNMStateTranslation';

import { V1beta1NodeNetworkState } from '@kubevirt-ui/kubevirt-api/nmstate';
import {
  Alert,
  AlertActionCloseButton,
  AlertVariant,
  Drawer,
  DrawerContent,
  DrawerContentBody,
  DrawerPanelBody,
  DrawerPanelContent,
} from '@patternfly/react-core';

import { CREATE_POLICY_QUERY_PARAM } from '../constants';
import CustomDrawer from '../CustomDrawer';

import '.././TopologySidebar.scss';

type Props = {
  states: V1beta1NodeNetworkState[];
  children: ReactNode;
};

const TopologyDrawer: FC<Props> = ({ states, children }) => {
  const { t } = useNMStateTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);

  const [successMessage, setSuccessMessage] = useState<string>('');

  const closeDrawer = () => {
    const updatedParams = new URLSearchParams(location.search);
    updatedParams.delete(CREATE_POLICY_QUERY_PARAM);
    navigate({ search: updatedParams.toString() });
  };

  const isDrawerOpen = queryParams.get(CREATE_POLICY_QUERY_PARAM) === 'true';

  return (
    <Drawer isExpanded={isDrawerOpen} position="left">
      <DrawerContent
        panelContent={
          <DrawerPanelContent
            isResizable
            defaultSize="1200px"
            minSize="150px"
            role="dialog"
            aria-label={t('Topology side panel')}
            className="drawerPanelContent"
          >
            <DrawerPanelBody>
              {successMessage && (
                <div className="nmstate-topology__sidebar__success-alert">
                  <Alert
                    isInline
                    variant={AlertVariant.success}
                    title={successMessage}
                    actionClose={<AlertActionCloseButton onClose={() => setSuccessMessage('')} />}
                  />
                </div>
              )}
              <CustomDrawer states={states} onClose={closeDrawer} onSuccess={setSuccessMessage} />
            </DrawerPanelBody>
          </DrawerPanelContent>
        }
      >
        <DrawerContentBody>{children}</DrawerContentBody>
      </DrawerContent>
    </Drawer>
  );
};
export default TopologyDrawer;
