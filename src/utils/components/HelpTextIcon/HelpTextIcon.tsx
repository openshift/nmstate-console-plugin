import React, { FC, ReactNode } from 'react';

import { Popover } from '@patternfly/react-core';
import { HelpIcon } from '@patternfly/react-icons';

type HelpTextIconProps = {
  headerContent?: ReactNode;
  bodyContent?: ReactNode;
};

const HelpTextIcon: FC<HelpTextIconProps> = ({ bodyContent, headerContent }) => (
  <Popover bodyContent={bodyContent} headerContent={headerContent}>
    <HelpIcon />
  </Popover>
);

export default HelpTextIcon;
