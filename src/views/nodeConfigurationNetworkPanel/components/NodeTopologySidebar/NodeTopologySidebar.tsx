import React, { FC } from 'react';
import { useLocation, useNavigate } from 'react-router';

import { V1beta1NodeNetworkState } from '@kubevirt-ui/kubevirt-api/nmstate';
import { TopologySideBar } from '@patternfly/react-topology';
import { isEmpty } from '@utils/helpers';
import useQueryParams from '@utils/hooks/useQueryParams';
import { SELECTED_ID_QUERY_PARAM } from '@utils/topology/components/TopologySidebar/constants';
import CustomDrawer from '@utils/topology/components/TopologySidebar/CustomDrawer';

import '@utils/topology/components/TopologySidebar/TopologySidebar.scss';

type TopologySidebarProps = {
  states: V1beta1NodeNetworkState[];
};

const NodeTopologySidebar: FC<TopologySidebarProps> = ({ states }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const queryParams = useQueryParams();

  const selectedIDExist = !isEmpty(queryParams?.[SELECTED_ID_QUERY_PARAM]);

  const showSidebar = selectedIDExist;

  const closeDrawer = () => {
    navigate({ pathname: location.pathname, search: '' });
  };

  return (
    <TopologySideBar
      show={showSidebar}
      onClose={selectedIDExist ? closeDrawer : null}
      className="nmstate-topology__sidebar"
    >
      <div className="nmstate-topology__sidebar__content">
        <CustomDrawer states={states} />
      </div>
    </TopologySideBar>
  );
};

export default NodeTopologySidebar;
