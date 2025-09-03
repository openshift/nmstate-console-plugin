import { K8sModel } from '@openshift-console/dynamic-plugin-sdk';

export const ClusterUserDefinedNetworkModel: K8sModel = {
  abbr: 'CUDN',
  apiGroup: 'k8s.ovn.org',
  apiVersion: 'v1',
  crd: true,
  id: 'clusteruserdefinednetwork',
  kind: 'ClusterUserDefinedNetwork',
  label: 'clusteruserdefinednetwork',
  // t('plugin__nmstate-console-plugin~ClusterUserDefinedNetwork')
  labelKey: 'ClusterUserDefinedNetwork',
  labelPlural: 'ClusterUserDefinedNetworks',
  // t('plugin__nmstate-console-plugin~ClusterUserDefinedNetworks')
  labelPluralKey: 'ClusterUserDefinedNetworks',
  namespaced: false,
  plural: 'clusteruserdefinednetworks',
};
