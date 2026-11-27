import { describe, expect, it, jest } from '@jest/globals';

/**
 * `@patternfly/react-topology` pulls ESM-only d3 packages into Jest's CommonJS runtime and
 * its BaseLayout needs a live graph, so the layout boundary is mocked: only the maths this
 * class implements (level sorting, counting and positioning) runs for real.
 */
jest.mock('@patternfly/react-topology', () => ({
  BaseLayout: class BaseLayout {
    nodes: unknown[] = [];
    edges: unknown[] = [];
    constructor(public graph: unknown) {}
  },
  GRAPH_LAYOUT_END_EVENT: 'graph-layout-end',
}));
jest.mock('@patternfly/react-topology/dist/esm/layouts/GridNode', () => ({
  GridNode: class GridNode {},
}));
jest.mock('@patternfly/react-topology/dist/esm/layouts/GridLink', () => ({
  GridLink: class GridLink {},
}));
jest.mock('@patternfly/react-topology/dist/esm/layouts/GridGroup', () => ({
  GridGroup: class GridGroup {},
}));

import { LevelsLayout } from './LevelsLayout';

type FakeNode = {
  element: { getId: () => string; setPosition: jest.Mock };
  height: number;
  id: string;
  update: jest.Mock;
  width: number;
  x?: number;
  y?: number;
};

/** LevelsLayout only reads id/width/height/element (data + parent), so a plain object works. */
const layoutNode = (id: string, level: number, parentId?: string): FakeNode => ({
  element: {
    getId: () => id,
    getParent: () => (parentId ? { getId: () => parentId } : undefined),
    getData: () => ({ level }),
    setPosition: jest.fn(),
  } as never,
  height: 50,
  id,
  update: jest.fn(),
  width: 100,
});

// `nodes` and `startLayout` are protected, and the graph is only used for one event.
class TestLayout extends LevelsLayout {
  run(nodes: FakeNode[]): void {
    this.nodes = nodes as never;
    this.startLayout(this.graph, true, false);
  }
}

const graph = { getController: () => ({ fireEvent: jest.fn() }) };

describe('LevelsLayout', () => {
  it('places nodes side by side within a level and stacks levels vertically', () => {
    const first = layoutNode('n1', 0, 'group-1');
    const second = layoutNode('n2', 0, 'group-1');
    const third = layoutNode('n3', 1, 'group-1');

    new TestLayout(graph as never).run([third, second, first]);

    expect([first.x, first.y]).toEqual([0, 0]);
    expect([second.x, second.y]).toEqual([120, 0]);
    expect([third.x, third.y]).toEqual([0, 140]);
    // The real GridNode moves the element inside update(); the fake only records the call.
    expect(first.update).toHaveBeenCalled();
  });

  it('leaves nodes without a parent group untouched', () => {
    const orphan = layoutNode('n1', 0);

    new TestLayout(graph as never).run([orphan]);

    expect(orphan.x).toBeUndefined();
    expect(orphan.y).toBeUndefined();
  });
});
