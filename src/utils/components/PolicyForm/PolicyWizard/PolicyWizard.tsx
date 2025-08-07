import React, { FC, MouseEventHandler, useCallback, useState } from 'react';
import { useNMStateTranslation } from 'src/utils/hooks/useNMStateTranslation';
import { Updater } from 'use-immer';

import { V1NodeNetworkConfigurationPolicy } from '@kubevirt-ui/kubevirt-api/nmstate';
import { Wizard, WizardStep } from '@patternfly/react-core';
import NodesConfigurationStep from '@utils/components/PolicyForm/PolicyWizard/steps/NodesConfigurationStep/NodesConfigurationStep';
import SettingsStep from '@utils/components/PolicyForm/PolicyWizard/steps/SettingsStep/SettingsStep';
import { getOVNLocalnet } from '@utils/components/PolicyForm/PolicyWizard/utils/selectors';
import { ConnectionOption } from '@utils/components/PolicyForm/PolicyWizard/utils/types';
import {
  getUplinkConnectionOption,
  uplinkSettingsValid,
} from '@utils/components/PolicyForm/PolicyWizard/utils/utils';
import { getName } from '@utils/components/resources/selectors';
import { isEmpty } from '@utils/helpers';

import { ensureNoEmptyBridgeMapping } from '../utils/utils';

import NetworkIdentity from './steps/NetworkIdentity/NetworkIdentity';
import ReviewStep from './steps/ReviewStep/ReviewStep';
import UplinkConnectionStep from './steps/UplinkConnectionStep/UplinkConnectionStep';

import '../policy-form.scss';
import './PolicyWizard.scss';

type PolicyWizardProps = {
  policy: V1NodeNetworkConfigurationPolicy;
  setPolicy: Updater<V1NodeNetworkConfigurationPolicy>;
  onSubmit: () => void | Promise<void>;
  onClose: () => void;
  onStepChange?: (stepId: string | number) => void;
};

const PolicyWizard: FC<PolicyWizardProps> = ({
  policy,
  setPolicy,
  onSubmit,
  onClose,
  onStepChange,
}) => {
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
      onStepChange={(_, currentStep) => {
        onStepChange?.(currentStep.id);
      }}
      className="nmstate-policy-wizard policy-form-content"
    >
      <WizardStep
        footer={{ isNextDisabled: isEmpty(getOVNLocalnet(policy)) }}
        id="policy-wizard-network-identity"
        name={t('Network identity')}
      >
        <NetworkIdentity policy={policy} setPolicy={setPolicy} />
      </WizardStep>
      <WizardStep
        footer={{ isNextDisabled: isEmpty(getName(policy)) }}
        id="policy-wizard-basic-info"
        name={t('Nodes configuration')}
      >
        <NodesConfigurationStep policy={policy} setPolicy={setPolicy} />
      </WizardStep>
      <WizardStep
        id="policy-wizard-uplink-connection"
        name={t('Uplink connection')}
        footer={{ isNextDisabled: !uplinkSettingsValid(policy) }}
      >
        <UplinkConnectionStep policy={policy} setPolicy={setPolicy} />
      </WizardStep>
      <WizardStep
        name={t('Settings')}
        id="policy-wizard-configuration"
        isDisabled={getUplinkConnectionOption(policy) === ConnectionOption.BREX}
      >
        <SettingsStep policy={policy} setPolicy={setPolicy} />
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
