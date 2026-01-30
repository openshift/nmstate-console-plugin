import { V1beta1NodeNetworkConfigurationEnactment } from '@kubevirt-ui/kubevirt-api/nmstate';

import { ENACTMENT_LABEL_NODE, ENACTMENT_LABEL_POLICY } from '@utils/constants';

export const getEnactmentStateNNCP = (
  enactment: V1beta1NodeNetworkConfigurationEnactment,
): string => enactment?.metadata?.labels?.[ENACTMENT_LABEL_POLICY];

export const getEnactmentStateNode = (
  enactment: V1beta1NodeNetworkConfigurationEnactment,
): string => enactment?.metadata?.labels?.[ENACTMENT_LABEL_NODE];
