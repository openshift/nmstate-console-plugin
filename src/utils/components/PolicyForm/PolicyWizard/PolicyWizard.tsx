import React, { FC, MouseEventHandler, useCallback, useState } from 'react';
import { useNMStateTranslation } from 'src/utils/hooks/useNMStateTranslation';
import { Updater } from 'use-immer';

import { Wizard, WizardStep } from '@patternfly/react-core';
import { InterfaceType, V1NodeNetworkConfigurationPolicy } from '@types';
import { isEmpty } from '@utils/helpers';

import BasicInfoStep from './BasicInfoStep';
import InterfacesStep from './InterfacesStep';
import ReviewStep from './ReviewStep';

import '../policy-form.scss';
import './policy-wizard.scss';

type PolicyWizardProps = {
  policy: V1NodeNetworkConfigurationPolicy;
  setPolicy: Updater<V1NodeNetworkConfigurationPolicy>;
  onSubmit: () => void | Promise<void>;
  onClose: () => void;
};

const PolicyWizard: FC<PolicyWizardProps> = ({ policy, setPolicy, onSubmit, onClose }) => {
  const { t } = useNMStateTranslation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error>(null);

  const onFormSubmit: MouseEventHandler<HTMLButtonElement> = useCallback(async () => {
    setLoading(true);

    try {
      await onSubmit();
    } catch (error) {
      setError(error);
    } finally {
      setLoading(false);
    }
  }, [onSubmit]);

  return (
    <Wizard
      onSave={onFormSubmit}
      onClose={onClose}
      className="nmstate-policy-wizard policy-form-content"
    >
      <WizardStep
        footer={{ isNextDisabled: isEmpty(policy.metadata.name) }}
        id="policy-wizard-basicinfo"
        name={t('Basic policy info')}
      >
        <BasicInfoStep policy={policy} setPolicy={setPolicy} />
      </WizardStep>
      <WizardStep
        id="policy-wizard-interfaces"
        name={t('Policy interfaces')}
        footer={{
          nextButtonProps: { isLoading: loading },
          isNextDisabled: loading,
          nextButtonText: t('Save'),
        }}
        steps={[
          <WizardStep
            name={t('Basic interfaces')}
            id="policy-wizard-basic-interfaces"
            key="policy-wizard-basic-interfaces"
          >
            <InterfacesStep
              policy={policy}
              setPolicy={setPolicy}
              interfaceTypes={[InterfaceType.ETHERNET]}
              label={t('Ethernet')}
            />
          </WizardStep>,
          <WizardStep
            name={t('Bonding')}
            id="policy-wizard-bonding-interfaces"
            key="policy-wizard-bonding-interfaces"
          >
            <InterfacesStep
              policy={policy}
              setPolicy={setPolicy}
              interfaceTypes={[InterfaceType.BOND]}
              label={t('Bonding')}
            />
          </WizardStep>,
          <WizardStep
            name={t('Bridging')}
            id="policy-wizard-bridge-interfaces"
            key="policy-wizard-bridge-interfaces"
          >
            <InterfacesStep
              policy={policy}
              setPolicy={setPolicy}
              interfaceTypes={[InterfaceType.LINUX_BRIDGE, InterfaceType.OVS_BRIDGE]}
              label={t('Bridging')}
            />
          </WizardStep>,
        ]}
      ></WizardStep>

      <WizardStep
        footer={{
          isNextDisabled: isEmpty(policy.metadata.name),
          nextButtonProps: { isLoading: loading },
          nextButtonText: t('Create policy'),
        }}
        id="policy-wizard-review"
        name={t('Review and create')}
      >
        <ReviewStep policy={policy} error={error} />
      </WizardStep>
    </Wizard>
  );
};

export default PolicyWizard;
