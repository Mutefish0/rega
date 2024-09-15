import React from "react";
import Relative from "../../primitives/Relative";
import YogaNode from "../YogaFlex/YogaNode";
import Box2D from "../Box2D";

import { FlexStyle } from "../YogaFlex/FlexStyle";

export interface ViewStyle extends FlexStyle {
  backgroundColor?: string;
}

interface ViewProps {
  children?: React.ReactNode;
  style?: ViewStyle;
}

export default function View({ children = null, style = {} }: ViewProps) {
  const [layout, setLayout] = React.useState({
    width: 0,
    height: 0,
    left: 0,
    top: 0,
  });

  return (
    <YogaNode
      style={style}
      onLayout={(node) => {
        const viewLayout = node.getComputedLayout();
        setLayout(viewLayout);
      }}
    >
      {layout && (
        <Relative translation={{ x: layout.left, y: -layout.top }}>
          {!!style.backgroundColor && (
            <Box2D
              anchor="top-left"
              size={[layout.width, layout.height]}
              color={style.backgroundColor}
            />
          )}
        </Relative>
      )}
      {children}
    </YogaNode>
  );
}
