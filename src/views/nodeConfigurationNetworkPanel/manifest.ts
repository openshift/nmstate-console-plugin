import type { EncodedExtension } from '@openshift-console/dynamic-plugin-sdk-webpack';

export const NodeConfigurationNetworkPanelModules = {
  NodeTopologyPage: './views/nodeConfigurationNetworkPanel/NodeTopologyPage',
};

export const NodeConfigurationNetworkPanelExtensions: EncodedExtension[] = [
  {
    type: 'console.node/sub-nav-tab',
    properties: {
      parentTab: 'configuration',
      page: {
        tabId: 'network',
        name: '%plugin__nmstate-console-plugin~Network%',
        priority: 100,
      },
      component: { $codeRef: 'NodeTopologyPage' },
    },
  } as EncodedExtension,
];
