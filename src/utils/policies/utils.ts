import { V1beta1NodeNetworkConfigurationEnactment, V1NodeNetworkConfigurationPolicy } from '@types';
import { ENACTMENT_LABEL_POLICY } from '@utils/constants';

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
