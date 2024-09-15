import { useContext, useMemo } from "react";
import ThreeContext from "../../primitives/ThreeContext";
import YogaNode from "../YogaFlex/YogaNode";
import { FlexStyle } from "../YogaFlex/FlexStyle";

interface Props {
  root?: boolean;
  screenId?: string;
  style?: FlexStyle;
  children?: React.ReactNode;
}

export default function Screen({
  root,
  screenId,
  style = {},
  children,
}: Props) {
  const ctx = useContext(ThreeContext);

  const _style = useMemo(
    () =>
      root
        ? {
            ...style,
            width: ctx.size[0] / ctx.pixelRatio,
            height: ctx.size[1] / ctx.pixelRatio,
          }
        : style,
    [style]
  );

  return (
    <YogaNode
      style={_style}
      onLayout={
        screenId
          ? (node) => {
              const layout = node.getComputedLayout();

              ctx.viewportMap.set(screenId, {
                x: layout.left,
                y: ctx.size[1] / ctx.pixelRatio - layout.height - layout.top,
                z: layout.width,
                w: layout.height,
              });
            }
          : undefined
      }
    >
      {children}
    </YogaNode>
  );
}
