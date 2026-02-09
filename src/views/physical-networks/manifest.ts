import { HrefNavItem, RoutePage } from '@openshift-console/dynamic-plugin-sdk';
import type {
  ConsolePluginBuildMetadata,
  EncodedExtension,
} from '@openshift-console/dynamic-plugin-sdk-webpack';

export const PhysicalNetworksExposedModules: ConsolePluginBuildMetadata['exposedModules'] = {
  PhysicalNetworksPage: './views/physical-networks/PhysicalNetworksPage',
};

export const PhysicalNetworksExtensions: EncodedExtension[] = [
  {
    flags: {
      required: ['NMSTATE_DYNAMIC'],
    },
    properties: {
      dataAttributes: {
        'data-quickstart-id': 'qs-nav-physical-networks',
        'data-test-id': 'physical-networks-nav-item',
      },
      href: 'physical-networks',
      id: 'physical-networks',
      insertBefore: 'networkPolicies',
      name: '%plugin__nmstate-console-plugin~Physical networks%',
      prefixNamespaced: false,
      section: 'networking',
    },
    type: 'console.navigation/href',
  } as EncodedExtension<HrefNavItem>,
  {
    flags: {
      required: ['NMSTATE_DYNAMIC'],
    },
    properties: {
      component: {
        $codeRef: 'PhysicalNetworksPage',
      },
      path: ['physical-networks'],
    },
    type: 'console.page/route',
  } as EncodedExtension<RoutePage>,
];
