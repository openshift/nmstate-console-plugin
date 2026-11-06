import { TFunction } from 'react-i18next';

import { getRowActions } from './utils';

const t = ((key: string) => key) as unknown as TFunction;

describe('getRowActions', () => {
  it('navigates to the VM network creation page using an absolute path', () => {
    const navigate = jest.fn();

    const actions = getRowActions(t, navigate, 'br-ex', true);
    actions[1].onClick();

    expect(navigate).toHaveBeenCalledWith(
      '/k8s/cluster/virtualmachine-networks/~new?physicalNetworkName=br-ex',
    );
  });

  it('omits the VM network action when kubevirt is not installed', () => {
    const actions = getRowActions(t, jest.fn(), 'br-ex', false);

    expect(actions).toHaveLength(1);
  });
});
