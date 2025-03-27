import { IoK8sApiCoreV1Node } from '@kubevirt-ui/kubevirt-api/kubernetes/models';
import { NodeNetworkConfigurationInterface, V1NodeNetworkConfigurationPolicy } from '@types';
import { isEmpty } from '@utils/helpers';

export const getMatchedPolicyNodes = (
  policy: V1NodeNetworkConfigurationPolicy,
  nodes: IoK8sApiCoreV1Node[],
) => {
  if (isEmpty(policy.spec.nodeSelector)) return nodes;

  return nodes.filter((node) =>
    Object.entries(policy).every(
      ([labelKey, labelValue]) => node.metadata?.labels?.[labelKey] === labelValue,
    ),
  );
};

export const getInterfaceToShow = (
  policy: V1NodeNetworkConfigurationPolicy,
  interfaceName: string,
) =>
  policy?.spec?.desiredState?.interfaces?.find(
    (policyInterface) => policyInterface.name === interfaceName,
  ) || (policy?.spec?.desiredState?.interfaces?.[0] as NodeNetworkConfigurationInterface);
