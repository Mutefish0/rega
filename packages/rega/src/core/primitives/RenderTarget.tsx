import React, { useContext, useEffect, useMemo } from "react";
import ThreeContext from "./ThreeContext";
import RenderContext from "./RenderContext";
import YogaNode from "../components/YogaFlex/YogaNode";
import { FlexStyle } from "../components/YogaFlex/FlexStyle";
import { TransferResource } from "../render";
import {
  createUniformBinding,
  createUniformBindingView,
} from "../../core/render/binding";
import { WGSLValueType } from "pure3";

interface CommomProps {
  children?: React.ReactNode;
  style?: FlexStyle;
  bindings?: Record<string, TransferResource>;
}

type PType = "main" | "sub";

type Props<T extends PType> = T extends "main"
  ? CommomProps & { main: true; targetId?: never }
  : CommomProps & { main?: never; targetId: string };

export const mainTarget = "___main___";

export default function RenderTarget<T extends PType>(props: Props<T>) {
  const { main, targetId = mainTarget, children, style, bindings = {} } = props;

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
    // "cameraProjectionMatrix",
    const bCameraProjectionMatrix = createUniformBinding("mat4");
    // "cameraViewMatrix"
    const bCameraViewMatrix = createUniformBinding("mat4");

    const allBindings = {
      cameraProjectionMatrix: bCameraProjectionMatrix.resource,
      cameraViewMatrix: bCameraViewMatrix.resource,
      ...bindings,
    } as Record<string, TransferResource>;

    renderCtx.renderTargets.set(targetId, {
      bindings: allBindings,
    });

    for (let name in allBindings) {
      const bind = allBindings[name];
      renderCtx.renderTargetBindGroupLayout[name] = bind.type;
    }

    renderCtx.server.createRenderTarget(targetId, sab, allBindings);

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

export function useTargetBindingView(
  targetId: string,
  name: string,
  type: WGSLValueType
) {
  const renderCtx = useContext(RenderContext);

  const view = useMemo(() => {
    const target = renderCtx.renderTargets.get(targetId)!;
    const bind = target.bindings[name];
    if (bind.type === "uniformBuffer") {
      return createUniformBindingView(bind.buffer, type);
    } else {
      throw new Error(
        "useTargetBindingView: not supported uniform type: " + bind.type
      );
    }
  }, [name, type]);

  return view;
}
