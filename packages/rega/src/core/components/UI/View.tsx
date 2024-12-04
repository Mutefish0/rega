import React, { useState, useCallback, useContext, useMemo } from "react";
import Relative from "../../primitives/Relative";
import YogaNode, { Node } from "../YogaFlex/YogaNode";
import Image from "./Image";
import Box2D from "../Box2D";
import BlockContext from "./BlockContext";

import { FlexStyle } from "../YogaFlex/FlexStyle";

export interface ViewStyle extends FlexStyle {
  backgroundColor?: string;
  backgroundImage?: string;
  opacity?: number;
}

interface ViewProps {
  children?: React.ReactNode;
  style?: ViewStyle;
}

export default function View({ children = null, style = {} }: ViewProps) {
  const parantBlockContext = useContext(BlockContext);

  const blockContext = useMemo(() => {
    const opacity = style.opacity ?? 1;
    return {
      ...parantBlockContext,
      opacity: opacity * parantBlockContext.opacity,
    };
  }, [parantBlockContext, style.opacity]);

  const [layout, setLayout] = useState({
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
    <>
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
              opacity={blockContext.opacity}
            />
          )}
          {!!style.backgroundImage && (
            <Image
              size={[layout.width, layout.height]}
              src={style.backgroundImage}
              opacity={blockContext.opacity}
            />
          )}
          <yoga style={style} onLayout={onLayout}>
            {children ? (
              <BlockContext.Provider value={blockContext}>
                {children}
              </BlockContext.Provider>
            ) : null}
          </yoga>
        </Relative>
      )}
    </>
  );
}
