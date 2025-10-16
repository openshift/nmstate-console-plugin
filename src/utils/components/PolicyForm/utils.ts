import { TFunction } from 'react-i18next';
import { MAX_INTERFACE_NAME_LENGTH } from 'src/views/policies/constants';

import {
  InterfaceType,
  NodeNetworkConfigurationInterface,
  V1NodeNetworkConfigurationPolicy,
} from '@kubevirt-ui/kubevirt-api/nmstate';
import { isEmpty } from '@utils/helpers';
import { t } from '@utils/hooks/useNMStateTranslation';
import { OVN_BRIDGE_MAPPINGS } from '@utils/resources/ovn/constants';

import { INTERFACE_TYPE_LABEL } from './constants';

export const getExpandableTitle = (
  nncpInterface: NodeNetworkConfigurationInterface,
  t: TFunction,
): string => {
  if (nncpInterface && nncpInterface.type && nncpInterface.name)
    return `${INTERFACE_TYPE_LABEL[nncpInterface.type] || nncpInterface.type} ${
      nncpInterface.name
    }`;

  return t('Policy interface');
};

export const doesOVSBridgeExist = (policy: V1NodeNetworkConfigurationPolicy): boolean =>
  policy?.spec?.desiredState?.interfaces?.some(
    (iface: NodeNetworkConfigurationInterface) => iface?.type === InterfaceType.OVS_BRIDGE,
  );

export const validateInterfaceName = (
  interfaceName: string,
  interfaceNamesInUse?: string[],
): string => {
  if (!interfaceName) return '';

  if (interfaceNamesInUse?.filter((name) => name === interfaceName)?.length > 1) {
    // t('Name already in use by another interface')
    return t('Name already in use by another interface');
  }

  if (interfaceName.length > MAX_INTERFACE_NAME_LENGTH) {
    // t('Interface name should follow the linux kernel naming convention. The name should be smaller than 16 characters.')
    return t(
      'Interface name should follow the linux kernel naming convention. The name should be smaller than 16 characters.',
    );
  }

  if (/[/ ]/.test(interfaceName)) {
    // t('Interface name should follow the linux kernel naming convention. Whitespaces and slashes are not allowed.')
    return t(
      'Interface name should follow the linux kernel naming convention. Whitespaces and slashes are not allowed.',
    );
  }
  return '';
};

export function capitalizeFirstLetter(string: string) {
  return string ? string.charAt(0).toUpperCase() + string.slice(1) : '';
}

export const ensureNoEmptyBridgeMapping = (
  policy: V1NodeNetworkConfigurationPolicy,
): Error | undefined => {
  const emptyBridgeMapping = policy?.spec?.desiredState?.ovn?.[OVN_BRIDGE_MAPPINGS]?.find(
    (mapping) => isEmpty(mapping?.localnet) || isEmpty(mapping?.bridge),
  );

  if (!isEmpty(emptyBridgeMapping)) {
    return new Error(t('Empty bridge mapping is not allowed'));
  }
};
