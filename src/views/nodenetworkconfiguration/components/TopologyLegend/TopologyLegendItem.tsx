import React, { FC, ReactElement, ReactNode } from 'react';

import {
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
} from '@patternfly/react-core';

type TopologyLegendItemProps = {
  icon: ReactNode;
  description: string;
};

const TopologyLegendItem: FC<TopologyLegendItemProps> = ({ icon, description }): ReactElement => {
  return (
    <DescriptionListGroup className="pf-v6-u-align-items-center">
      <DescriptionListTerm>{icon}</DescriptionListTerm>
      <DescriptionListDescription>{description}</DescriptionListDescription>
    </DescriptionListGroup>
  );
};

export default TopologyLegendItem;
