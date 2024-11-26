import React, { useCallback } from "react";
import Relative from "../../primitives/Relative";
import YogaNode, { Node } from "../YogaFlex/YogaNode";
import Image from "./Image";
import Box2D from "../Box2D";

import { FlexStyle } from "../YogaFlex/FlexStyle";

export interface ViewStyle extends FlexStyle {
  backgroundColor?: string;
  backgroundImage?: string;
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

  const onLayout = useCallback((node: Node) => {
    const viewLayout = node.getComputedLayout();
    setLayout(viewLayout);
  }, []);

  return (
    <YogaNode style={style} onLayout={onLayout}>
      {layout && (
        <Relative
          translation={{
            x: layout.left,
            y: -layout.top,
          }}
        >
          {!!style.backgroundColor && (
            <Box2D
              anchor="top-left"
              size={[layout.width, layout.height]}
              color={style.backgroundColor}
            />
          )}
          {!!style.backgroundImage && (
            <Image
              size={[layout.width, layout.height]}
              src={style.backgroundImage}
            />
          )}
          {children}
        </Relative>
      )}
    </YogaNode>
  );
}
