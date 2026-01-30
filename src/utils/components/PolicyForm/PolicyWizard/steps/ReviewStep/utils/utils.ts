import { TFunction } from 'react-i18next';

import { V1NodeNetworkConfigurationPolicy } from '@kubevirt-ui/kubevirt-api/nmstate';
import { DEFAULT_OVS_INTERFACE_NAME } from '@utils/components/PolicyForm/PolicyWizard/utils/constants';
import {
  getAggregationMode,
  getBondName,
  getBridgePortNames,
} from '@utils/components/PolicyForm/PolicyWizard/utils/selectors';
import { ConnectionOption } from '@utils/components/PolicyForm/PolicyWizard/utils/types';
import { getUplinkConnectionOption } from '@utils/components/PolicyForm/PolicyWizard/utils/utils';
import { NO_DATA_DASH } from '@utils/constants';

const getBridgePortsWithoutDefaultOVSIface = (policy: V1NodeNetworkConfigurationPolicy) =>
  getBridgePortNames(policy)?.filter((port) => port !== DEFAULT_OVS_INTERFACE_NAME) || [];

const getBondUplinkDisplayText = (policy: V1NodeNetworkConfigurationPolicy) => {
  const bondPorts = getBridgePortsWithoutDefaultOVSIface(policy).join(' + ');
  const bondName = getBondName(policy);
  const aggregationMode = getAggregationMode(policy);

  return `${bondName} (${bondPorts}), mode=(${aggregationMode})`;
};

export const getUplinkDisplayText = (policy: V1NodeNetworkConfigurationPolicy, t: TFunction) => {
  const connectionOption = getUplinkConnectionOption(policy);
  switch (connectionOption) {
    case ConnectionOption.BREX:
      return t("Cluster's default network");
    case ConnectionOption.SINGLE_DEVICE:
      return getBridgePortsWithoutDefaultOVSIface(policy)?.[0];
    case ConnectionOption.BONDING_INTERFACE:
      return getBondUplinkDisplayText(policy);
    default:
      return NO_DATA_DASH;
  }
};
