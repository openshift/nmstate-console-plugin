import React, { FC } from 'react';
import { useHistory } from 'react-router';
import classNames from 'classnames';

import { V1beta1NodeNetworkState } from '@kubevirt-ui/kubevirt-api/nmstate';
import { TopologySideBar } from '@patternfly/react-topology';
import { isEmpty } from '@utils/helpers';
import useQueryParams from '@utils/hooks/useQueryParams';

import { CREATE_POLICY_QUERY_PARAM, SELECTED_ID_QUERY_PARAM } from './constants';
import Drawer from './Drawer';

import './TopologySidebar.scss';

type TopologySidebarProps = {
  states: V1beta1NodeNetworkState[];
};
const TopologySidebar: FC<TopologySidebarProps> = ({ states }) => {
  const history = useHistory();

  const queryParams = useQueryParams();

  const selectedIDExist = !isEmpty(queryParams?.[SELECTED_ID_QUERY_PARAM]);
  const createPolicyDrawer = !isEmpty(queryParams?.[CREATE_POLICY_QUERY_PARAM]);

  const showSidebar = selectedIDExist || createPolicyDrawer;

  const closeDrawer = () => {
    history.push({ search: new URLSearchParams({}).toString() });
  };

  return (
    <TopologySideBar
      show={showSidebar}
      onClose={selectedIDExist ? closeDrawer : null}
      className={classNames('nmstate-topology__sidebar', { 'big-sidebar': createPolicyDrawer })}
    >
      <div className="nmstate-topology__sidebar__content">
        <Drawer states={states} onClose={closeDrawer} />
      </div>
    </TopologySideBar>
  );
};

export default TopologySidebar;
