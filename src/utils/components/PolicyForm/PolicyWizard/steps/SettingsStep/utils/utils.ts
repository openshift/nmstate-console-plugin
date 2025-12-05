import { TFunction } from 'react-i18next';

import { MAX_MTU, MIN_MTU } from './constants';

export const validateMTU = (newMTU: string, t: TFunction) => {
  if (!newMTU) return '';

  const mtu = +newMTU;

  if (mtu < MIN_MTU || mtu > MAX_MTU) {
    return t('Value must be between 1,280 and 9,000.');
  }
};
