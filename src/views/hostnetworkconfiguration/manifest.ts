import type { EncodedExtension } from '@openshift/dynamic-plugin-sdk';
import type { HrefNavItem, RoutePage } from '@openshift-console/dynamic-plugin-sdk';

export const HostNetworkConfigurationModules = {
  Topology: './views/hostnetworkconfiguration/Topology',
};

export const HostNetworkConfigurationExtensions: EncodedExtension[] = [
  {
    properties: {
      dataAttributes: {
        'data-quickstart-id': 'qs-nav-virtualization-host-network-configuration',
        'data-test-id': 'virtualization-host-network-configuration-nav-item',
      },
      href: 'host-network-configuration',
      id: 'virtualization-host-network-configuration',
      name: '%plugin__nmstate-console-plugin~Host network configuration%',
      section: 'networking-virt-perspective',
      perspective: 'virtualization-perspective',
    },
    type: 'console.navigation/href',
  } as EncodedExtension<HrefNavItem>,
  {
    properties: {
      dataAttributes: {
        'data-quickstart-id': 'qs-nav-host-network-configuration',
        'data-test-id': 'host-network-configuration-nav-item',
      },
      href: 'host-network-configuration',
      id: 'host-network-configuration',
      name: '%plugin__nmstate-console-plugin~Host network configuration%',
      section: 'networking',
    },
    type: 'console.navigation/href',
  } as EncodedExtension<HrefNavItem>,
  {
    type: 'console.page/route',
    properties: {
      path: ['host-network-configuration'],
      component: {
        $codeRef: 'Topology',
      },
    },
  } as EncodedExtension<RoutePage>,
];
