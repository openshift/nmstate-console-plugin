import React, { FC } from 'react';
import { useNavigate } from 'react-router-dom-v5-compat';
import NodeNetworkConfigurationPolicyModel, {
  NodeNetworkConfigurationPolicyModelRef,
} from 'src/console-models/NodeNetworkConfigurationPolicyModel';

import { ListPageCreateDropdown } from '@openshift-console/dynamic-plugin-sdk';
import { getResourceUrl } from '@utils/helpers';
import { useNMStateTranslation } from '@utils/hooks/useNMStateTranslation';
import { NNCP_YAML_EDITOR_OPENED } from '@utils/telemetry/constants';
import { logNMStateEvent } from '@utils/telemetry/telemetry';

const CreatePolicyButtons: FC = ({ children }) => {
  const { t } = useNMStateTranslation();
  const navigate = useNavigate();

  const createItems = {
    form: t('From Form'),
    yaml: t('With YAML'),
  };

  const onCreate = (type: string) => {
    const baseURL = getResourceUrl({
      model: NodeNetworkConfigurationPolicyModel,
    });

    if (type === 'yaml') {
      logNMStateEvent(NNCP_YAML_EDITOR_OPENED);
    }

    return type === 'form'
      ? navigate('/node-network-configuration?createPolicy=true')
      : navigate(`${baseURL}~new`);
  };

  return (
    <ListPageCreateDropdown
      items={createItems}
      onClick={onCreate}
      createAccessReview={{
        groupVersionKind: NodeNetworkConfigurationPolicyModelRef,
      }}
    >
      {children}
    </ListPageCreateDropdown>
  );
};

export default CreatePolicyButtons;
