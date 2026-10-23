import type { IoK8sApiCoreV1Node } from '@kubevirt-ui-ext/kubevirt-api/kubernetes';
import { getName } from '@utils/components/resources/selectors';

export const getNodeNames = (nodes: IoK8sApiCoreV1Node[]) => nodes.map((node) => getName(node));
