import { V1NodeNetworkConfigurationPolicy } from '@kubevirt-ui/kubevirt-api/nmstate';
import { NodeNetworkConfigurationPolicyModelGroupVersionKind } from '@models';
import { WatchK8sResource } from '@openshift-console/dynamic-plugin-sdk';
import { NNCPNodeSelectorMap } from '@utils/components/PolicyForm/PolicyWizard/utils/hooks/useExistingNNCPsNodes/utils/types';
import { getName } from '@utils/components/resources/selectors';
import { getNodeSelector } from '@utils/resources/policies/getters';

export const getNodeSelectorsByNNCP = (nncps: V1NodeNetworkConfigurationPolicy[]) =>
  nncps.reduce((acc: NNCPNodeSelectorMap, policy) => {
    acc[getName(policy)] = getNodeSelector(policy);

    return acc;
  }, {});

export const getNodeResources = (nncpNodeSelectorMap: NNCPNodeSelectorMap) =>
  Object.entries(nncpNodeSelectorMap).reduce(
    (acc: Record<string, WatchK8sResource>, [name, nodeSelector]) => {
      acc[name] = {
        groupVersionKind: NodeNetworkConfigurationPolicyModelGroupVersionKind,
        isList: true,
        selector: {
          matchLabels: nodeSelector,
        },
      };

      return acc;
    },
    {},
  );
