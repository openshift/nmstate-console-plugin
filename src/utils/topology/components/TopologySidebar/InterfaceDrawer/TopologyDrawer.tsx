import React, { FC, ReactNode, useCallback, useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';

import { V1beta1NodeNetworkState } from '@kubevirt-ui-ext/kubevirt-api/nmstate';
import {
  Alert,
  AlertActionCloseButton,
  AlertVariant,
  Drawer,
  DrawerActions,
  DrawerCloseButton,
  DrawerContent,
  DrawerContentBody,
  DrawerHead,
  DrawerPanelBody,
  DrawerPanelContent,
} from '@patternfly/react-core';
import { isEmpty } from '@utils/helpers';
import { useNMStateTranslation } from '@utils/hooks/useNMStateTranslation';

import { CREATE_POLICY_QUERY_PARAM, SELECTED_ID_QUERY_PARAM } from '../constants';
import CustomDrawer from '../CustomDrawer';

import '../TopologySidebar.scss';

type Props = {
  states: V1beta1NodeNetworkState[];
  children: ReactNode;
};

const TopologyDrawer: FC<Props> = ({ states, children }) => {
  const { t } = useNMStateTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const drawerRef = useRef<HTMLDivElement>(null);

  const [successMessage, setSuccessMessage] = useState<string>('');
  const [drawerWidth, setDrawerWidth] = useState<string>('');

  const closeDrawer = useCallback(() => {
    const updatedParams = new URLSearchParams(location.search);
    updatedParams.delete(CREATE_POLICY_QUERY_PARAM);
    updatedParams.delete(SELECTED_ID_QUERY_PARAM);
    navigate({ search: updatedParams.toString() });
  }, [location.search, navigate]);

  const isCreatePolicyDrawerOpen = queryParams.get(CREATE_POLICY_QUERY_PARAM) === 'true';
  const isNodeSelectedDrawerOpen = !isEmpty(queryParams.get(SELECTED_ID_QUERY_PARAM));
  const isDrawerOpen = isCreatePolicyDrawerOpen || isNodeSelectedDrawerOpen;

  // Determine drawer position and size based on content
  const drawerPosition = isCreatePolicyDrawerOpen ? 'left' : 'right';
  const drawerDefaultSize = isCreatePolicyDrawerOpen ? '75%' : '25%';

  // Reset width when drawer type changes
  useEffect(() => {
    setDrawerWidth('');
  }, [isCreatePolicyDrawerOpen, isNodeSelectedDrawerOpen]);

  const handleResize = useCallback(
    (_event: MouseEvent | TouchEvent | React.KeyboardEvent, width: number) => {
      // Store the width in pixels for the drawer
      setDrawerWidth(`${width}px`);
    },
    [],
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isDrawerOpen && drawerRef.current && !drawerRef.current.contains(event.target as Node)) {
        closeDrawer();
      }
    };

    if (isDrawerOpen) document.addEventListener('mousedown', handleClickOutside);

    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isDrawerOpen, closeDrawer]);

  return (
    <Drawer isExpanded={isDrawerOpen} position={drawerPosition}>
      <DrawerContent
        panelContent={
          <DrawerPanelContent
            key={`drawer-${drawerPosition}`}
            isResizable
            defaultSize={drawerWidth || drawerDefaultSize}
            minSize="150px"
            onResize={handleResize}
            role="dialog"
            aria-label={t('Topology side panel')}
            className="drawerPanelContent"
          >
            <div ref={drawerRef}>
              <DrawerHead>
                <DrawerActions>
                  <DrawerCloseButton onClick={closeDrawer} />
                </DrawerActions>
              </DrawerHead>
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
            </div>
          </DrawerPanelContent>
        }
      >
        <DrawerContentBody>{children}</DrawerContentBody>
      </DrawerContent>
    </Drawer>
  );
};
export default TopologyDrawer;
