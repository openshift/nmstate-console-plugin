import { t } from '@utils/hooks/useNMStateTranslation';

import { NodeNetworkConfigurationInterfaceBondMode as AggregationMode } from '../../../../../../../../../nmstate-types/custom-models/NodeNetworkConfigurationInterfaceBondMode';

export const aggregationModes = {
  [AggregationMode.BALANCE_SLB]: {
    description: t('Load balancing, no switch config'),
    label: t('Open vSwitch SLB - source load balancing'),
    helperText: t('Failover results in loss of guest network connectivity.'),
  },
  [AggregationMode.ACTIVE_BACKUP]: {
    description: t('One active, others standby, simple'),
    label: t('Linux Bonding - Active / Backup (Mode 1)'),
    helperText: t('Failover results in loss of guest network connectivity.'),
  },
  [AggregationMode.BALANCE_XOR]: {
    description: t('MAC-based load balancing, requires static Etherchannel enabled'),
    label: t('Linux Bonding - Balance XOR (Mode 2)'),
    helperText: t(
      'Require switch configuration to establish an "EtherChannel" or similar port grouping.',
    ),
  },
  [AggregationMode.LACP]: {
    description: t('Standard link aggregation, requires LACP Etherchannel enabled'),
    label: t('Linux Bonding - 802.3ad / LACP (Mode 4)'),
    helperText: t(
      'Require switch configuration to establish an "EtherChannel" or similar port grouping.',
    ),
  },
};
