import { TFunction } from 'react-i18next';

import {
  InterfaceType,
  NodeNetworkConfigurationInterface,
  V1NodeNetworkConfigurationPolicy,
} from '@types';
import { isEmpty } from '@utils/helpers';
import { t } from '@utils/hooks/useNMStateTranslation';
import { OVN_BRIDGE_MAPPINGS } from '@utils/ovn/constants';

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

export const ensurePolicyInterfaces = (policy: V1NodeNetworkConfigurationPolicy) => {
  if (!policy.spec.desiredState) {
    policy.spec.desiredState = {};
  }

  if (!policy.spec.desiredState.interfaces) {
    policy.spec.desiredState.interfaces = [];
  }
};

export const ensureOvnBridgeMappings = (policy: V1NodeNetworkConfigurationPolicy) => {
  if (!policy.spec.desiredState) {
    policy.spec.desiredState = {};
  }

  if (!policy.spec.desiredState.ovn) {
    policy.spec.desiredState.ovn = {
      [OVN_BRIDGE_MAPPINGS]: [],
    };
  }

  if (!policy.spec.desiredState.ovn[OVN_BRIDGE_MAPPINGS]) {
    policy.spec.desiredState.ovn[OVN_BRIDGE_MAPPINGS] = [];
  }
};

export const omitEmptyInterfaces = (
  policy: V1NodeNetworkConfigurationPolicy,
): V1NodeNetworkConfigurationPolicy => {
  const desiredState = { ...policy.spec?.desiredState };

  if (!desiredState.interfaces?.length) {
    delete desiredState.interfaces;
  }

  if (!desiredState.ovn?.[OVN_BRIDGE_MAPPINGS]?.length) {
    delete desiredState.ovn;
  }

  return {
    ...policy,
    spec: {
      ...policy.spec,
      desiredState,
    },
  };
};

export const validateInterfaceName = (name: string): string => {
  if (!name) return '';

  if (name.length > 15) {
    // t('Interface name should follow the linux kernel naming convention. The name should be smaller than 16 characters.')
    return t(
      'Interface name should follow the linux kernel naming convention. The name should be smaller than 16 characters.',
    );
  }

  if (/[/ ]/.test(name)) {
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
