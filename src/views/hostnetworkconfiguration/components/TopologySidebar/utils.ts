import { IoK8sApiCoreV1Node } from '@kubevirt-ui/kubevirt-api/kubernetes/models';
import { V1beta1NodeNetworkConfigurationPolicy } from '@types';
import { isEmpty } from '@utils/helpers';

export const isPolicyAppliedInNode = (
  policy: V1beta1NodeNetworkConfigurationPolicy,
  node: IoK8sApiCoreV1Node,
) => {
  if (isEmpty(policy.spec.nodeSelector)) return true;

  return Object.entries(policy.spec.nodeSelector).every(
    ([labelKey, labelValue]) => node?.metadata?.labels?.[labelKey] === labelValue,
  );
};
