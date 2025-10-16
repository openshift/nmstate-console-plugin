import React, { FC } from 'react';
import { Link } from 'react-router-dom-v5-compat';
import NodeNetworkConfigurationPolicyModel from 'src/console-models/NodeNetworkConfigurationPolicyModel';
import { useNMStateTranslation } from 'src/utils/hooks/useNMStateTranslation';

import { V1NodeNetworkConfigurationPolicy } from '@kubevirt-ui/kubevirt-api/nmstate';
import { useAccessReview } from '@openshift-console/dynamic-plugin-sdk';
import { Alert, AlertVariant, Breadcrumb, BreadcrumbItem, Title } from '@patternfly/react-core';
import DetailsPageTitle from '@utils/components/DetailsPageTitle/DetailsPageTitle';
import PaneHeading from '@utils/components/PaneHeading/PaneHeading';
import { getResourceUrl } from '@utils/helpers';

import PolicyActions from '../actions/PolicyActions';
import { isPolicySupported } from '../utils';

type PolicyPageTitleProps = {
  policy: V1NodeNetworkConfigurationPolicy;
  name: string;
};

const PolicyPageTitle: FC<PolicyPageTitleProps> = ({ policy, name }) => {
  const { t } = useNMStateTranslation();
  const formSupported = isPolicySupported(policy);

  const [canUpdatePolicy] = useAccessReview({
    verb: 'update',
    resource: NodeNetworkConfigurationPolicyModel.plural,
  });

  return (
    <DetailsPageTitle
      breadcrumb={
        <Breadcrumb>
          <BreadcrumbItem>
            <Link to={getResourceUrl({ model: NodeNetworkConfigurationPolicyModel })}>
              {t(NodeNetworkConfigurationPolicyModel.labelPlural)}
            </Link>
          </BreadcrumbItem>
          <BreadcrumbItem>
            {t('{{modelName}} details', { modelName: NodeNetworkConfigurationPolicyModel.label })}
          </BreadcrumbItem>
        </Breadcrumb>
      }
    >
      <PaneHeading>
        <Title className="co-resource-item" headingLevel="h1">
          <span className="co-m-resource-icon co-m-resource-icon--lg">
            {NodeNetworkConfigurationPolicyModel.abbr}
          </span>
          <span data-test-id="resource-title">{name ?? policy?.metadata?.name} </span>
        </Title>
        <PolicyActions policy={policy} />
      </PaneHeading>

      {policy && canUpdatePolicy === false && (
        <Alert isInline variant={AlertVariant.info} title={t("You're in view-only mode")}>
          {t('To edit this policy, contact your administrator.')}
        </Alert>
      )}
      {policy && canUpdatePolicy && !formSupported && (
        <Alert
          variant={AlertVariant.info}
          isInline
          title={t('This policy must be edited via YAML')}
        />
      )}
    </DetailsPageTitle>
  );
};

export default PolicyPageTitle;
