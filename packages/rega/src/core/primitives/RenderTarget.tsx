import React, { useContext, useEffect, useMemo } from "react";
import ThreeContext from "../primitives/ThreeContext";
import RenderContext from "./RenderContext";
import YogaNode from "../components/YogaFlex/YogaNode";
import { FlexStyle } from "../components/YogaFlex/FlexStyle";

interface GlobalBinding {}

interface FrameBinding {}

interface TargetBinding {}

interface ObjectBinding {}

interface CommomProps {
  children?: React.ReactNode;
  style?: FlexStyle;
}

type PType = "main" | "sub";

type Props<T extends PType> = T extends "main"
  ? CommomProps & { main: true; targetId?: never }
  : CommomProps & { main?: never; targetId: string };

export const mainTarget = "___main___";

export default function RenderTarget<T extends PType>(props: Props<T>) {
  const { main, targetId = mainTarget, children, style } = props;

  const ctx = useContext(ThreeContext);
  const renderCtx = useContext(RenderContext);

  const { sab, view } = useMemo(() => {
    // 4 * 4
    const sab = new SharedArrayBuffer(16);
    const view = new Float32Array(sab);
    return { sab, view };
  }, []);

  const _style = useMemo(
    () =>
      main
        ? {
            ...style,
            width: ctx.size[0] / ctx.pixelRatio,
            height: ctx.size[1] / ctx.pixelRatio,
          }
        : style,
    [style]
  );

  useEffect(() => {
    renderCtx.server.createRenderTarget(targetId, sab);
    return () => {
      renderCtx.server.removeRenderTarget(targetId);
    };
  }, []);

  return (
    <YogaNode
      style={_style}
      onLayout={(node) => {
        const layout = node.getComputedLayout();
        view.set([
          layout.left,
          ctx.size[1] / ctx.pixelRatio - layout.height - layout.top,
          layout.width,
          layout.height,
        ]);
      }}
    >
      {children}
    </YogaNode>
  );
}
