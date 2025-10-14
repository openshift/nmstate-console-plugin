import React, { FC } from 'react';

import {
  CHASSIS_ID,
  NodeNetworkConfigurationInterfaceLLDPNeighbor,
} from '@kubevirt-ui/kubevirt-api/nmstate';
import { Stack, StackItem, Tooltip } from '@patternfly/react-core';
import { useNMStateTranslation } from '@utils/hooks/useNMStateTranslation';
import {
  getChassisId,
  getDescription,
  getIee8021Vlans,
  getPortId,
  getSystemDescription,
  getSystemName,
} from '@utils/resources/neighbors/getters';

const NeighborInformation: FC<{ neighbor: NodeNetworkConfigurationInterfaceLLDPNeighbor }> = ({
  neighbor,
}) => {
  const { t } = useNMStateTranslation();

  const chassisIDDescription = getDescription(neighbor, CHASSIS_ID);
  const portId = getPortId(neighbor);
  const chassisId = getChassisId(neighbor);
  const systemName = getSystemName(neighbor);
  const systemDescription = getSystemDescription(neighbor);
  const iee8021Vlans = getIee8021Vlans(neighbor).sort((a, b) => a.vid - b.vid);

  return (
    <Stack>
      {chassisId && (
        <StackItem>
          <strong>{chassisIDDescription}</strong>: {chassisId}
        </StackItem>
      )}

      {portId && (
        <StackItem>
          <strong>{t('Port')}</strong>: {portId}
        </StackItem>
      )}
      {systemName && (
        <StackItem>
          <strong>{t('System name')}</strong>: {systemName}
        </StackItem>
      )}
      {systemDescription && (
        <StackItem>
          <strong>{t('System description')}</strong>: {systemDescription}
        </StackItem>
      )}
      {iee8021Vlans && (
        <StackItem>
          <strong>{t('VLANS')}</strong>:{' '}
          {iee8021Vlans?.map((vlan, index) => (
            <>
              <Tooltip content={vlan.name} key={vlan.vid}>
                <span>{vlan.vid}</span>
              </Tooltip>
              {index !== iee8021Vlans.length - 1 ? ', ' : ''}
            </>
          ))}
        </StackItem>
      )}
    </Stack>
  );
};

export default NeighborInformation;
