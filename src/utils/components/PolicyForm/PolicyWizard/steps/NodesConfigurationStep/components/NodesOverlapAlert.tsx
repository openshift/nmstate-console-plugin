import React, { FC } from 'react';
import { Link } from 'react-router-dom-v5-compat';

import { V1NodeNetworkConfigurationPolicy } from '@kubevirt-ui/kubevirt-api/nmstate';
import {
  Alert,
  AlertVariant,
  ExpandableSection,
  Label,
  Split,
  SplitItem,
  Stack,
  StackItem,
} from '@patternfly/react-core';
import { getNodesURL } from '@utils/components/PolicyForm/PolicyWizard/steps/NodesConfigurationStep/utils/utils';
import { NNCPNodeConflict } from '@utils/components/PolicyForm/PolicyWizard/utils/hooks/useNNCPNodesConflicts/utils/types';
import { getName } from '@utils/components/resources/selectors';
import { isEmpty } from '@utils/helpers';
import { useNMStateTranslation } from '@utils/hooks/useNMStateTranslation';
import { getNodeSelector } from '@utils/resources/policies/getters';

type NodesOverlapAlertProps = {
  currentPolicy: V1NodeNetworkConfigurationPolicy;
  nncpNodeConflicts: NNCPNodeConflict[];
};

const NodesOverlapAlert: FC<NodesOverlapAlertProps> = ({ currentPolicy, nncpNodeConflicts }) => {
  const { t } = useNMStateTranslation();

  if (isEmpty(nncpNodeConflicts)) return null;

  return (
    <Alert variant={AlertVariant.danger} title={t('Nodes overlap detected')}>
      <Stack>
        <StackItem>
          {t(
            'Some of the selected Nodes are already assigned to {{nodeNetworkName}} in another configuration.',
            { nodeNetworkName: getName(currentPolicy) }, // TODO Check this
          )}
          <br />
          {t('Each node network configuration must apply to a unique set of Nodes.')}
        </StackItem>
        <StackItem>
          <ExpandableSection
            toggleText={t('Conflicting configurations ({{conflictingConfigCount}})', {
              conflictingConfigCount: nncpNodeConflicts?.length,
            })}
          >
            {nncpNodeConflicts.map((conflict) => (
              <Split key={conflict.name}>
                <SplitItem>{conflict.name}</SplitItem>
                <SplitItem>
                  <Label>{conflict.nodeSelector}</Label>
                </SplitItem>
                <SplitItem>
                  <Link
                    to={getNodesURL({
                      ...conflict.nodeSelector,
                      ...getNodeSelector(currentPolicy),
                    })}
                  >
                    {t('Overlapping nodes')}
                  </Link>
                </SplitItem>
              </Split>
            ))}
          </ExpandableSection>
        </StackItem>
      </Stack>
    </Alert>
  );
};

export default NodesOverlapAlert;
