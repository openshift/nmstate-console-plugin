import {
  BaseLayout,
  Edge,
  Graph,
  GRAPH_LAYOUT_END_EVENT,
  GridLayoutOptions,
  Layout,
  LayoutLink,
  LayoutNode,
  Node,
} from '@patternfly/react-topology';
import { GridGroup } from '@patternfly/react-topology/dist/esm/layouts/GridGroup';
import { GridLink } from '@patternfly/react-topology/dist/esm/layouts/GridLink';
import { GridNode } from '@patternfly/react-topology/dist/esm/layouts/GridNode';

export class LevelsLayout extends BaseLayout implements Layout {
  constructor(graph: Graph, options?: Partial<GridLayoutOptions>) {
    super(graph, options);
  }

  // Method to sort nodes by their level
  private sortNodesByLevel(nodes: LayoutNode[]): LayoutNode[] {
    return nodes.sort((a, b) => {
      const aLevel = a?.element?.getData()?.level;
      const bLevel = b?.element?.getData()?.level;
      return aLevel - bLevel;
    });
  }

  // Method to count nodes per level
  private countNodesPerLevel(nodes: LayoutNode[]): { [level: number]: number } {
    const levelCounts: { [level: number]: number } = {};
    nodes.forEach((node) => {
      const level = node?.element?.getData()?.level;
      if (!levelCounts[level]) {
        levelCounts[level] = 0;
      }
      levelCounts[level]++;
    });
    return levelCounts;
  }

  protected createLayoutNode(node: Node, nodeDistance: number, index: number) {
    return new GridNode(node, nodeDistance, index);
  }

  protected createLayoutLink(
    edge: Edge,
    source: LayoutNode,
    target: LayoutNode,
    isFalse: boolean,
  ): LayoutLink {
    return new GridLink(edge, source, target, isFalse);
  }

  protected createLayoutGroup(node: Node, padding: number, index: number) {
    return new GridGroup(node, padding, index);
  }

  private layoutGroupNodes(
    groupNodes: LayoutNode[],
    offsetX: number,
    offsetY: number,
  ): { width: number; height: number } {
    const sortedNodes = this.sortNodesByLevel(groupNodes);
    const totalNodes = sortedNodes.length;
    let padX = 0;
    let padY = 0;

    // Determine maximum width and height of nodes
    for (let i = 0; i < totalNodes; i++) {
      const node = sortedNodes[i];
      if (padX < node.width) {
        padX = node.width;
      }
      if (padY < node.height) {
        padY = node.height;
      }
    }

    const levelCounts = this.countNodesPerLevel(sortedNodes);
    let currentLevel = sortedNodes[0]?.element?.getData()?.level;
    let nodesInCurrentLevel = 0;

    let x = offsetX;
    let y = offsetY;
    let maxX = x;
    let maxY = y;

    for (let i = 0; i < totalNodes; i++) {
      const node = sortedNodes[i];
      if (node?.element?.getData()?.level !== currentLevel) {
        // Move to the next level when the level changes
        currentLevel = node?.element?.getData()?.level;
        x = offsetX;
        y += padY + 20; // Adding some extra space between levels
        nodesInCurrentLevel = 0;
      }

      node.x = x;
      node.y = y;
      node.update();

      nodesInCurrentLevel++;
      const numNodesInRow = levelCounts[currentLevel];

      if (nodesInCurrentLevel < numNodesInRow) {
        x += padX + 20; // Adding some extra space between nodes
      } else {
        x = offsetX;
        y += padY + 20; // Move to the next row within the same level
        nodesInCurrentLevel = 0;
      }

      // Track maxX and maxY to determine the total space used by this group
      if (x > maxX) {
        maxX = x;
      }
      if (y > maxY) {
        maxY = y;
      }
    }

    // Return the dimensions of the group layout
    return { width: maxX - offsetX + padX, height: maxY - offsetY + padY };
  }

  protected startLayout(graph: Graph, initialRun: boolean, addingNodes: boolean): void {
    if (initialRun || addingNodes) {
      this.nodes.sort((a, b) => a.id.localeCompare(b.id));
      const groups: { [groupId: string]: LayoutNode[] } = {};

      // Group nodes by their parent group
      this.nodes.forEach((node) => {
        const parentGroupId = node.element.getParent()?.getId();
        if (parentGroupId) {
          if (!groups[parentGroupId]) {
            groups[parentGroupId] = [];
          }
          groups[parentGroupId].push(node);
        }
      });

      // Layout grid for groups
      const groupKeys = Object.keys(groups);
      const totalGroups = groupKeys.length;
      const numCols = Math.ceil(Math.sqrt(totalGroups));

      let offsetX = 0;
      let offsetY = 0;

      const groupDimensions = groupKeys.map((key) => this.layoutGroupNodes(groups[key], 0, 0));
      const maxGroupWidth = Math.max(...groupDimensions.map((dim) => dim.width));
      const maxGroupHeight = Math.max(...groupDimensions.map((dim) => dim.height));

      for (let row = 0; row < Math.ceil(totalGroups / numCols); row++) {
        for (let col = 0; col < numCols; col++) {
          const groupIndex = row * numCols + col;
          if (groupIndex < totalGroups) {
            const groupNodes = groups[groupKeys[groupIndex]];
            this.layoutGroupNodes(groupNodes, offsetX, offsetY);
            offsetX += maxGroupWidth + 50;
          }
        }
        offsetX = 0;
        offsetY += maxGroupHeight + 50;
      }
    }

    this.graph.getController().fireEvent(GRAPH_LAYOUT_END_EVENT, { graph: this.graph });
  }
}
