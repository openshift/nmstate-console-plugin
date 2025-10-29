import { V1beta1NodeNetworkConfigurationEnactment } from '@kubevirt-ui/kubevirt-api/nmstate';

export const getEnactmentStatus = (enactment: V1beta1NodeNetworkConfigurationEnactment): string =>
  enactment?.status?.conditions?.find((condition) => condition.status === 'True').type;

export const categorizeEnactments = (enactments: V1beta1NodeNetworkConfigurationEnactment[]) => {
  return (enactments || []).reduce(
    (acc, enactment) => {
      const status = getEnactmentStatus(enactment);

      if (acc[status?.toLowerCase()]) acc[status?.toLowerCase()].push(enactment);
      return acc;
    },
    {
      available: [],
      pending: [],
      failing: [],
      progressing: [],
      aborted: [],
    } as { [key in string]: V1beta1NodeNetworkConfigurationEnactment[] },
  );
};
