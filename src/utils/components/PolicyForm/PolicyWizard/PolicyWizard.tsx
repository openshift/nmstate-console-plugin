import React, { FC, MouseEventHandler, useCallback, useState } from 'react';
import { useNMStateTranslation } from 'src/utils/hooks/useNMStateTranslation';
import { Updater } from 'use-immer';

import { Wizard, WizardStep } from '@patternfly/react-core';
import { V1NodeNetworkConfigurationPolicy } from '@types';
import ConfigurationStep from '@utils/components/PolicyForm/PolicyWizard/steps/ConfigurationStep/ConfigurationStep';
import { getName } from '@utils/components/resources/selectors';
import { isEmpty } from '@utils/helpers';

import { ensureNoEmptyBridgeMapping } from '../utils/utils';

import BasicInfoStep from './steps/BasicInfoStep/BasicInfoStep';
import ReviewStep from './steps/ReviewStep/ReviewStep';
import UplinkConnectionStep from './steps/UplinkConnectionStep/UplinkConnectionStep';

import '../policy-form.scss';
import './PolicyWizard.scss';

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
    const error = ensureNoEmptyBridgeMapping(policy);

    if (error) return setError(error);

    setLoading(true);
    try {
      await onSubmit();
    } catch (error) {
      setError(error);
    } finally {
      setLoading(false);
    }
  }, [onSubmit, policy, t]);

  return (
    <Wizard
      onSave={onFormSubmit}
      onClose={onClose}
      className="nmstate-policy-wizard policy-form-content"
    >
      <WizardStep
        footer={{ isNextDisabled: isEmpty(getName(policy)) }}
        id="policy-wizard-basic-info"
        name={t('Basic information')}
      >
        <BasicInfoStep policy={policy} setPolicy={setPolicy} />
      </WizardStep>
      <WizardStep id="policy-wizard-uplink-connection" name={t('Uplink connection')}>
        <UplinkConnectionStep policy={policy} setPolicy={setPolicy} />
      </WizardStep>
      <WizardStep name={t('Configuration')} id="policy-wizard-configuration">
        <ConfigurationStep policy={policy} setPolicy={setPolicy} />
      </WizardStep>
      <WizardStep
        footer={{
          isNextDisabled: isEmpty(getName(policy)),
          nextButtonProps: { isLoading: loading },
          nextButtonText: t('Create network'),
        }}
        id="policy-wizard-review"
        name={t('Review and create')}
      >
        <ReviewStep policy={policy} creationError={error} setPolicy={setPolicy} />
      </WizardStep>
    </Wizard>
  );
};

export default PolicyWizard;
