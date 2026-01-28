import React, { FC, ReactNode } from 'react';
import {
  Drawer,
  DrawerContent,
  DrawerContentBody,
  DrawerPanelContent,
  DrawerPanelBody,
  Button,
} from '@patternfly/react-core';
import TimesIcon from '@patternfly/react-icons/dist/esm/icons/times-icon';

type Props = {
  isOpen: boolean;
  onClose: (b: boolean) => void;
  panel: ReactNode;
  children: ReactNode;
};

const TopologyDrawer: FC<Props> = ({ isOpen, onClose, panel, children }) => (
  <Drawer isExpanded={isOpen} position="left">
    <DrawerContent
      panelContent={
        <DrawerPanelContent
          isResizable
          defaultSize="1000px"
          minSize="150px"
          role="dialog"
          aria-label="Topology side panel"
          className="drawerPanelContent"
        >
          <DrawerPanelBody>
            <Button
              variant="plain"
              onClick={() => onClose(false)}
              aria-label="Close"
              style={{ position: 'absolute', top: 8, right: 8, zIndex: 1 }}
            >
              <TimesIcon />
            </Button>
            {isOpen && panel}
          </DrawerPanelBody>
        </DrawerPanelContent>
      }
    >
      <DrawerContentBody>{children}</DrawerContentBody>
    </DrawerContent>
  </Drawer>
);

export default TopologyDrawer;
