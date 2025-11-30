import React, { FC } from 'react';
import { useHistory } from 'react-router-dom';
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
  const history = useHistory();

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
      ? history.push('/node-network-configuration?createPolicy=true')
      : history.push(`${baseURL}~new`);
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
