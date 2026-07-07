import {
  InterfaceType,
  NodeNetworkConfigurationInterface,
  V1NodeNetworkConfigurationPolicy,
} from '@kubevirt-ui/kubevirt-api/nmstate';
import { LINK_AGGREGATION } from '@utils/components/PolicyForm/PolicyWizard/utils/constants';
import { NO_DATA_DASH } from '@utils/constants';

const resolveBondPortName = (port: string | { name?: string } | undefined): string | undefined => {
  if (!port) {
    return undefined;
  }
  if (typeof port === 'string') {
    return port;
  }

  return port.name;
};

const formatBridgeInterfaceAffects = (iface: NodeNetworkConfigurationInterface): string | null => {
  const ports = iface.bridge?.port || [];
  const names = ports.flatMap((p) => {
    const nestedPorts = p?.[LINK_AGGREGATION]?.port;
    if (nestedPorts?.length) {
      return nestedPorts
        .map((np) => resolveBondPortName(np as string | { name?: string }))
        .filter(Boolean);
    }
    return p?.name ? [p.name] : [];
  });

  return names.length ? `${iface.name} (${names.join(', ')})` : null;
};

const formatInterfaceAffects = (iface: NodeNetworkConfigurationInterface): string => {
  const la = iface[LINK_AGGREGATION];
  const bondPortNames = la?.port?.map(resolveBondPortName).filter(Boolean);

  if (iface.type === InterfaceType.BOND && bondPortNames?.length) {
    return `${iface.name} (${bondPortNames.join(', ')})`;
  }

  if (iface.type === InterfaceType.LINUX_BRIDGE || iface.type === InterfaceType.OVS_BRIDGE) {
    const bridgeText = formatBridgeInterfaceAffects(iface);
    if (bridgeText) {
      return bridgeText;
    }
  }

  return iface.name;
};

export const formatPolicyAffectsDisplay = (policy: V1NodeNetworkConfigurationPolicy): string => {
  const interfaces = policy.spec?.desiredState?.interfaces;
  if (!interfaces?.length) {
    return NO_DATA_DASH;
  }

  return interfaces.map(formatInterfaceAffects).join(', ');
};
