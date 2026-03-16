import { TFunction } from 'react-i18next';

import { IoK8sApiCoreV1Node } from '@kubevirt-ui/kubevirt-api/kubernetes/models';
import {
  InterfaceType,
  NodeNetworkConfigurationInterface,
  V1beta1NodeNetworkConfigurationEnactment,
  V1NodeNetworkConfigurationPolicy,
} from '@kubevirt-ui/kubevirt-api/nmstate';
import { DEFAULT_OVS_INTERFACE_NAME } from '@utils/components/PolicyForm/PolicyWizard/utils/constants';
import { ConnectionOption } from '@utils/components/PolicyForm/PolicyWizard/utils/types';
import { getUplinkConnectionOption } from '@utils/components/PolicyForm/PolicyWizard/utils/utils';
import { ENACTMENT_LABEL_POLICY, NO_DATA_DASH } from '@utils/constants';
import { isEmpty } from '@utils/helpers';
import {
  getAggregationMode,
  getBondName,
  getBridgePortNames,
} from '@utils/resources/policies/selectors';

export const getPolicyEnactments = (
  policy: V1NodeNetworkConfigurationPolicy,
  enactments: V1beta1NodeNetworkConfigurationEnactment[],
) =>
  policy
    ? enactments.filter(
        (enactment) =>
          enactment?.metadata?.labels?.[ENACTMENT_LABEL_POLICY] === policy?.metadata?.name,
      )
    : [];

export const isPolicyAppliedInNode = (
  policy: V1NodeNetworkConfigurationPolicy,
  node: IoK8sApiCoreV1Node,
) => {
  if (isEmpty(policy?.spec?.nodeSelector)) return true;

  return Object.entries(policy.spec.nodeSelector).every(
    ([labelKey, labelValue]) => node?.metadata?.labels?.[labelKey] === labelValue,
  );
};

export const filterPolicyAppliedNodes = (
  nodes: IoK8sApiCoreV1Node[],
  policy: V1NodeNetworkConfigurationPolicy,
) => (nodes || []).filter((node) => isPolicyAppliedInNode(policy, node));

export const getPolicyInterfaces = (
  policy: V1NodeNetworkConfigurationPolicy,
): NodeNetworkConfigurationInterface[] => policy.spec?.desiredState?.interfaces || [];

export const getPolicyInterfacesByType = (
  policy: V1NodeNetworkConfigurationPolicy,
  interfaceType: InterfaceType,
): NodeNetworkConfigurationInterface[] => {
  switch (interfaceType) {
    case InterfaceType.ETHERNET:
      return getPolicyEthernetInterfaces(policy);
    case InterfaceType.BOND:
      return getPolicyBondingInterfaces(policy);
    case InterfaceType.LINUX_BRIDGE:
    case InterfaceType.OVS_BRIDGE:
      return getPolicyBridgingInterfaces(policy);
    default:
      return [];
  }
};

export const getPolicyEthernetInterfaces = (policy): NodeNetworkConfigurationInterface[] =>
  getPolicyInterfaces(policy)?.filter((iface) => iface.type === InterfaceType.ETHERNET) || [];

export const getPolicyBondingInterfaces = (policy): NodeNetworkConfigurationInterface[] =>
  getPolicyInterfaces(policy)?.filter((iface) => iface.type === InterfaceType.BOND) || [];

export const getPolicyBridgingInterfaces = (policy): NodeNetworkConfigurationInterface[] =>
  getPolicyInterfaces(policy)?.filter((iface) =>
    [InterfaceType.LINUX_BRIDGE, InterfaceType.OVS_BRIDGE].includes(iface.type),
  ) || [];

export const getPolicyOVSInterfaces = (policy): NodeNetworkConfigurationInterface[] =>
  getPolicyInterfaces(policy)?.filter((iface) => iface.type === InterfaceType.OVS_INTERFACE) || [];

export const getBridgePortsWithoutDefaultOVSIface = (policy: V1NodeNetworkConfigurationPolicy) =>
  getBridgePortNames(policy)?.filter((port) => port !== DEFAULT_OVS_INTERFACE_NAME) || [];

export const getBondUplinkDisplayText = (policy: V1NodeNetworkConfigurationPolicy) => {
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
