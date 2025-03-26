import React, { FC, useMemo } from 'react';

import { NodeNetworkConfigurationPolicyModelGroupVersionKind } from '@models';
import { HorizontalNav, useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';
import { Bullseye } from '@patternfly/react-core';
import { V1NodeNetworkConfigurationPolicy } from '@types';
import Loading from '@utils/components/Loading/Loading';
import { useNMStateTranslation } from '@utils/hooks/useNMStateTranslation';

import PolicyDetailsPage from './PolicyDetailsPage';
import PolicyPageTitle from './PolicyPageTitle';
import PolicyYAMLPage from './PolicyYamlPage';

import './policy-page.scss';

type PolicyPageProps = {
  name: string;
  kind: string;
};

const PolicyPage: FC<PolicyPageProps> = ({ name }) => {
  const { t } = useNMStateTranslation();
  const [policy, loaded] = useK8sWatchResource<V1NodeNetworkConfigurationPolicy>({
    groupVersionKind: NodeNetworkConfigurationPolicyModelGroupVersionKind,
    name,
  });

  const pages = useMemo(
    () => [
      {
        href: '',
        name: t('Details'),
        component: PolicyDetailsPage,
      },
      {
        href: 'yaml',
        name: t('YAML'),
        component: PolicyYAMLPage,
      },
    ],
    [t],
  );

  return (
    <div className="nmstate-console-policy-page">
      <PolicyPageTitle policy={policy} name={name} />
      {loaded ? (
        <HorizontalNav pages={pages} resource={policy} />
      ) : (
        <Bullseye>
          <Loading />
        </Bullseye>
      )}
    </div>
  );
};

export default PolicyPage;
