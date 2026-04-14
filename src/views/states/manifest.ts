import type { ResourceListPage } from '@openshift-console/dynamic-plugin-sdk';
import type { EncodedExtension } from '@openshift-console/dynamic-plugin-sdk-webpack';

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
