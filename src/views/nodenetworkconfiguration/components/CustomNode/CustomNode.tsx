import React, { FC } from 'react';

import {
  DefaultNode,
  Node,
  WithDndDropProps,
  WithDragNodeProps,
  WithSelectionProps,
} from '@patternfly/react-topology';

import { ICON_SIZE } from '../../utils/constants';

import './CustomNode.scss';

type CustomNodeProps = {
  element: Node;
} & WithSelectionProps &
  WithDragNodeProps &
  WithDndDropProps;

const CustomNode: FC<CustomNodeProps> = ({ element, ...rest }) => {
  const data = element.getData();
  const Icon = data.icon;
  const { width, height } = element.getBounds();

  const xCenter = (width - ICON_SIZE) / 2;
  const yCenter = (height - ICON_SIZE) / 2;

  const isDerivedFromPolicy = data.isDerivedFromPolicy;
  return (
    <DefaultNode className="custom-node" element={element} truncateLength={8} {...rest}>
      <g transform={`translate(${xCenter}, ${yCenter})`}>
        <Icon width={ICON_SIZE} height={ICON_SIZE} />
      </g>
      {isDerivedFromPolicy && (
        <rect
          className="custom-node__inner-border"
          x={8}
          y={8}
          width={width - 16}
          height={height - 16}
          rx="50%"
          ry="50%"
          stroke="#007BFF"
          strokeWidth={2}
          fill="none"
        />
      )}
    </DefaultNode>
  );
};

export default CustomNode;
