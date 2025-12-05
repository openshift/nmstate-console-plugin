import { IoK8sApiCoreV1Node } from '@kubevirt-ui/kubevirt-api/kubernetes/models';
import { getName } from '@utils/components/resources/selectors';

export const getNodeNames = (nodes: IoK8sApiCoreV1Node[]) => nodes.map((node) => getName(node));
