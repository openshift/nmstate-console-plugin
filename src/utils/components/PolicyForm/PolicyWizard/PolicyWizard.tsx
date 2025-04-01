import React, { FC, MouseEventHandler, useCallback, useState } from 'react';
import { useNMStateTranslation } from 'src/utils/hooks/useNMStateTranslation';
import { Updater } from 'use-immer';

import { Wizard, WizardStep } from '@patternfly/react-core';
import { V1NodeNetworkConfigurationPolicy } from '@types';
import { isEmpty } from '@utils/helpers';

import BasicInfoStep from './BasicInfoStep';
import InterfacesStep from './InterfacesStep';

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
    <Wizard onSave={onFormSubmit} onClose={onClose} className="nmstate-policy-wizard">
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
          nextButtonText: 'Save',
        }}
      >
        <InterfacesStep policy={policy} setPolicy={setPolicy} error={error} />
      </WizardStep>
    </Wizard>
  );
};

export default PolicyWizard;
