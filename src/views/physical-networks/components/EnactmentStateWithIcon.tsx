import React, { FC } from 'react';

import { IconsByStatus } from '@utils/resources/enactments/icons';

type EnactmentStateWithIconProps = {
  status: string;
};

const EnactmentStateWithIcon: FC<EnactmentStateWithIconProps> = ({ status }) => {
  return (
    <>
      {IconsByStatus[status]}
      <span className="pf-v6-u-ml-sm">{status}</span>
    </>
  );
};

export default EnactmentStateWithIcon;
