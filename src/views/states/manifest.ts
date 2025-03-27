import type { EncodedExtension } from '@openshift/dynamic-plugin-sdk';
import type { ResourceListPage } from '@openshift-console/dynamic-plugin-sdk';

import { NodeNetworkStateModelGroupVersionKind } from '../../console-models';

export const StateExposedModules = {
  StatesList: './views/states/list/StatesList',
};

export const StateExtensions: EncodedExtension[] = [
  {
    type: 'console.page/resource/list',
    properties: {
      perspective: 'admin',
      model: NodeNetworkStateModelGroupVersionKind,
      component: { $codeRef: 'StatesList' },
    },
  } as EncodedExtension<ResourceListPage>,
];
