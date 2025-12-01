import {
  NodeNetworkConfigurationInterface,
  NodeNetworkConfigurationInterfaceIPV4,
  NodeNetworkConfigurationInterfaceIPV6,
  V1NodeNetworkConfigurationPolicy,
} from '@kubevirt-ui/kubevirt-api/nmstate';
import { getSegmentAnalytics } from '@openshift-console/dynamic-plugin-sdk-internal';

import { NNCP_CREATED, NNCP_IP_CONFIGURATION_USED, NNCP_NODE_SELECTOR_USED } from './constants';

export const logNMStateEvent = (
  eventName: string,
  properties?: Record<string, string | number | boolean | string[]>,
) => {
  const segmentAnalytics = getSegmentAnalytics();

  if (!segmentAnalytics?.analyticsEnabled) {
    console.warn('Analytics not enabled, skipping event:', eventName, properties);
    return;
  }

  segmentAnalytics.analytics.track(eventName, {
    category: 'nmstate',
    ...properties,
  });
};

type IPConfigMethod = 'dhcp' | 'static' | 'disabled';

type IPConfiguration = {
  ipv4Enabled?: boolean;
  ipv4Method?: IPConfigMethod;
  ipv6Enabled?: boolean;
  ipv6Method?: IPConfigMethod;
};

const getIPMethod = (
  ipConfig: NodeNetworkConfigurationInterfaceIPV4 | NodeNetworkConfigurationInterfaceIPV6,
): IPConfigMethod => {
  if (ipConfig?.dhcp) return 'dhcp';
  if (ipConfig?.address?.length > 0) return 'static';
  return 'disabled';
};

const getIPConfiguration = (iface: NodeNetworkConfigurationInterface): IPConfiguration => {
  const config: IPConfiguration = {};

  if (iface.ipv4?.enabled) {
    config.ipv4Enabled = true;
    config.ipv4Method = getIPMethod(iface.ipv4);
  }

  if (iface.ipv6?.enabled) {
    config.ipv6Enabled = true;
    config.ipv6Method = getIPMethod(iface.ipv6);
  }

  return config;
};

const getInterfaceTypes = (policy: V1NodeNetworkConfigurationPolicy): string[] => {
  const interfaces = policy?.spec?.desiredState?.interfaces || [];
  return interfaces.map((iface) => iface.type).filter(Boolean);
};

export const logCreationFailed = (eventName: string, error: Error) => {
  logNMStateEvent(eventName, {
    errorMessage: error?.message,
  });
};

export const logNNCPCreated = (policy: V1NodeNetworkConfigurationPolicy) => {
  const interfaces = policy?.spec?.desiredState?.interfaces || [];
  const nodeSelector = policy?.spec?.nodeSelector;
  const interfaceTypes = getInterfaceTypes(policy);

  const properties = {
    interfaceTypes,
    creationMethod: 'form',
  };

  logNMStateEvent(NNCP_CREATED, properties);

  if (nodeSelector) {
    logNMStateEvent(NNCP_NODE_SELECTOR_USED);
  }

  interfaces.forEach((iface, index) => {
    const ipConfig = getIPConfiguration(iface);

    if (ipConfig.ipv4Enabled || ipConfig.ipv6Enabled) {
      logNMStateEvent(NNCP_IP_CONFIGURATION_USED, {
        interfaceType: iface.type,
        interfaceIndex: index,
        ...ipConfig,
      });
    }
  });
};
