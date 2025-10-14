import React, { FC, Suspense } from 'react';

import { V1NodeNetworkConfigurationPolicy } from '@kubevirt-ui/kubevirt-api/nmstate';
import { ResourceYAMLEditor } from '@openshift-console/dynamic-plugin-sdk';
import { Bullseye } from '@patternfly/react-core';
import Loading from '@utils/components/Loading/Loading';

import './policy-yaml-page.scss';

type PolicyYAMLPageProps = {
  obj?: V1NodeNetworkConfigurationPolicy;
};

const PolicyYAMLPage: FC<PolicyYAMLPageProps> = ({ obj: policy }) => {
  if (!policy)
    return (
      <Bullseye>
        <Loading />
      </Bullseye>
    );

  return (
    <div className="nmstate-console-yaml-section">
      <Suspense
        fallback={
          <Bullseye>
            <Loading />
          </Bullseye>
        }
      >
        <ResourceYAMLEditor initialResource={policy} />
      </Suspense>
    </div>
  );
};

export default PolicyYAMLPage;
