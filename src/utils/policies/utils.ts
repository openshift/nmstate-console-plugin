import { IoK8sApiCoreV1Node } from '@kubevirt-ui/kubevirt-api/kubernetes/models';
import { V1beta1NodeNetworkConfigurationEnactment, V1NodeNetworkConfigurationPolicy } from '@types';
import { ENACTMENT_LABEL_POLICY } from '@utils/constants';
import { isEmpty } from '@utils/helpers';

export const getPolicyEnactments = (
  policy: V1NodeNetworkConfigurationPolicy,
  enactments: V1beta1NodeNetworkConfigurationEnactment[],
) =>
  policy
    ? enactments.filter(
        (enactment) =>
          enactment?.metadata?.labels?.[ENACTMENT_LABEL_POLICY] === policy?.metadata?.name,
      )
    : [];

export const isPolicyAppliedInNode = (
  policy: V1NodeNetworkConfigurationPolicy,
  node: IoK8sApiCoreV1Node,
) => {
  if (isEmpty(policy.spec.nodeSelector)) return true;

  return Object.entries(policy.spec.nodeSelector).every(
    ([labelKey, labelValue]) => node?.metadata?.labels?.[labelKey] === labelValue,
  );
};

export const filterPolicyAppliedNodes = (
  nodes: IoK8sApiCoreV1Node[],
  policy: V1NodeNetworkConfigurationPolicy,
) => nodes.filter((node) => isPolicyAppliedInNode(policy, node));
