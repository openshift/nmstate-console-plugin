import { useCallback } from 'react';

import { V1NodeNetworkConfigurationPolicy } from '@kubevirt-ui/kubevirt-api/nmstate';
import useNodeInterfaces from '@utils/components/PolicyForm/PolicyWizard/utils/hooks/useNodeInterfaces/useNodeInterfaces';
import { validateInterfaceName } from '@utils/components/PolicyForm/utils/utils';
import { useNMStateTranslation } from '@utils/hooks/useNMStateTranslation';
import { getNodeSelector } from '@utils/resources/policies/getters';

type UseBridgeNameValidation = (
  policy: V1NodeNetworkConfigurationPolicy,
) => (name: string) => string;

const useBridgeNameValidation: UseBridgeNameValidation = (policy) => {
  const { t } = useNMStateTranslation();
  const { existingInterfaceNames } = useNodeInterfaces(getNodeSelector(policy));

  return useCallback(
    (name: string) => {
      const basicValidationMessage = validateInterfaceName(name);
      const duplicateNameErrorMessage =
        existingInterfaceNames?.includes(name) &&
        t('This name is already in use. Use a different name to continue.');

      return basicValidationMessage || duplicateNameErrorMessage || '';
    },
    [existingInterfaceNames],
  );
};

export default useBridgeNameValidation;
