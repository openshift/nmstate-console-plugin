import type { EncodedExtension } from '@openshift/dynamic-plugin-sdk';
import type {
  ExtensionK8sModel,
  ResourceClusterNavItem,
  ResourceDetailsPage,
  ResourceListPage,
  YAMLTemplate,
} from '@openshift-console/dynamic-plugin-sdk';

import NodeNetworkConfigurationPolicyModel from '../../console-models/NodeNetworkConfigurationPolicyModel';

const PolicyExtensionModel: ExtensionK8sModel = {
  group: NodeNetworkConfigurationPolicyModel.apiGroup as string,
  kind: NodeNetworkConfigurationPolicyModel.kind,
  version: NodeNetworkConfigurationPolicyModel.apiVersion,
};

export const PolicyExposedModules = {
  PoliciesList: './views/policies/list/PoliciesList',
  PolicyTemplate: 'src/policy-template.ts',
  PolicyPage: './views/policies/details/PolicyPage',
};

export const PolicyExtensions: EncodedExtension[] = [
  {
    type: 'console.page/resource/list',
    properties: {
      perspective: 'admin',
      model: PolicyExtensionModel,
      component: { $codeRef: 'PoliciesList' },
    },
  } as EncodedExtension<ResourceListPage>,
  {
    type: 'console.yaml-template',
    properties: {
      name: 'default',
      model: PolicyExtensionModel,
      template: {
        $codeRef: 'PolicyTemplate.defaultPolicyTemplate',
      },
    },
  } as EncodedExtension<YAMLTemplate>,
  {
    type: 'console.page/resource/details',
    properties: {
      model: PolicyExtensionModel,
      component: { $codeRef: 'PolicyPage' },
    },
  } as EncodedExtension<ResourceDetailsPage>,
  {
    properties: {
      dataAttributes: {
        'data-quickstart-id': 'qs-nav-nodenetworkconfigurationpolicy',
        'data-test-id': 'nodenetworkconfigurationpolicy-nav-item',
      },
      id: 'nodenetworkconfigurationpolicy',
      model: PolicyExtensionModel,
      name: '%plugin__nmstate-console-plugin~NodeNetworkConfigurationPolicy%',
      section: 'networking',
      insertAfter: ['node-network-configuration'],
    },
    type: 'console.navigation/resource-cluster',
  } as EncodedExtension<ResourceClusterNavItem>,
  {
    properties: {
      dataAttributes: {
        'data-quickstart-id': 'qs-nav-policy-list',
        'data-test-id': 'policy-nav-list',
      },
      id: 'nodenetworkconfigurationpolicy-virt-perspective',
      model: PolicyExtensionModel,
      name: '%plugin__nmstate-console-plugin~NodeNetworkConfigurationPolicy%',
      perspective: 'virtualization-perspective',
      section: 'networking-virt-perspective',
      insertAfter: ['node-network-configuration-virt-perspective'],
    },
    type: 'console.navigation/resource-cluster',
  } as EncodedExtension<ResourceClusterNavItem>,
];
