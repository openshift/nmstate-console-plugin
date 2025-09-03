import { t } from '@utils/hooks/useNMStateTranslation';

import { MAX_MTU, MIN_MTU } from './constants';

export const validateMTU = (newMTU: string) => {
  if (!newMTU) return '';

  const mtu = +newMTU;

  if (mtu < MIN_MTU || mtu > MAX_MTU) {
    // t('Value must be between 1,280 and 9,000.')
    return t('Value must be between 1,280 and 9,000.');
  }
};
