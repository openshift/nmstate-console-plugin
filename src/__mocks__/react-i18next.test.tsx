import React from 'react';

import { describe, expect, it } from '@jest/globals';
import { render } from '@testing-library/react';

import { Trans } from './react-i18next';

// The elements are built with `createElement` rather than JSX so the i18next extractor, which
// scans `src/**`, does not pick these fixture strings up as translation keys.
describe('the react-i18next Trans double', () => {
  it('converts an interpolation object that sits inside a children array', () => {
    // Product code uses this shape, e.g. DeleteInterfaceModal:
    // `remove{' '}{{ interfaceType }} interface <strong>{{ name }}</strong>`.
    // `React.Children.map` throws on the object before the callback runs, so the double has to
    // convert array elements itself.
    const children = [
      'remove ',
      { interfaceType: 'vlan' } as unknown as React.ReactNode,
      ' interface',
    ];

    const { container } = render(React.createElement(Trans, null, children));

    expect(container.textContent).toBe('remove vlan interface');
  });

  it('converts an interpolation object nested in an element child', () => {
    const { container } = render(
      React.createElement(
        Trans,
        null,
        'before ',
        React.createElement('strong', null, { name: 'br0' } as unknown as React.ReactNode),
        ' after',
      ),
    );

    expect(container.textContent).toBe('before br0 after');
  });
});
