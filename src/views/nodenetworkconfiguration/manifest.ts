import type { EncodedExtension } from '@openshift/dynamic-plugin-sdk';
import type { HrefNavItem, RoutePage } from '@openshift-console/dynamic-plugin-sdk';

export const NodeNetworkConfigurationModules = {
  Topology: './views/nodenetworkconfiguration/Topology',
};

export const NodeNetworkConfigurationExtensions: EncodedExtension[] = [
  {
    properties: {
      dataAttributes: {
        'data-quickstart-id': 'qs-nav-node-network-configuration-virt-perspective',
        'data-test-id': 'node-network-configuration-virt-perspective-nav-item',
      },
      href: 'node-network-configuration',
      id: 'node-network-configuration-virt-perspective',
      name: '%plugin__nmstate-console-plugin~Node network configuration%',
      section: 'networking-virt-perspective',
      perspective: 'virtualization-perspective',
      insertAfter: ['udns-virt-perspective', 'networkpolicies-virt-perspective'],
    },
    type: 'console.navigation/href',
  } as EncodedExtension<HrefNavItem>,
  {
    properties: {
      dataAttributes: {
        'data-quickstart-id': 'qs-nav-node-network-configuration',
        'data-test-id': 'node-network-configuration-nav-item',
      },
      href: 'node-network-configuration',
      id: 'node-network-configuration',
      name: '%plugin__nmstate-console-plugin~Node network configuration%',
      section: 'networking',
      insertAfter: ['udns', 'networkPolicies'],
    },
    type: 'console.navigation/href',
  } as EncodedExtension<HrefNavItem>,
  {
    type: 'console.page/route',
    properties: {
      path: ['node-network-configuration'],
      component: {
        $codeRef: 'Topology',
      },
    },
  } as EncodedExtension<RoutePage>,
];
