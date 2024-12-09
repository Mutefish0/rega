import React, { createContext, useContext, useEffect, useMemo } from "react";
import ThreeContext from "./ThreeContext";
import RenderContext from "./RenderContext";
import { FlexStyle } from "../components/YogaFlex/FlexStyle";
import { TransferResource, TransferBinding } from "../render";
import TextureManager, { Texture } from "../common/texture_manager";
import { createUniformBinding } from "../../core/render/binding";
import useBindings from "../hooks/useBingdings";
import { UniformType } from "../render";

import { getOrcreateSlot } from "../render/slot";
import { Matrix4 } from "pure3";

export const RenderTargetContext = createContext({
  root: true as boolean,
  bindings: {} as Record<string, TransferResource>,
});

interface Props {
  id: string;
  camera?: React.ReactNode;
  light?: React.ReactNode;
  children?: React.ReactNode;
  style?: FlexStyle;
  bindingsLayout?: Record<string, UniformType>;
}

const emptyMatrix = new Matrix4();

export default function RenderTarget(props: Props) {
  const { id, camera, light, children, style, bindingsLayout = {} } = props;

  const ctx = useContext(ThreeContext);
  const renderCtx = useContext(RenderContext);

  const bindings = useBindings(bindingsLayout);

  const parentRenderTargetCtx = useContext(RenderTargetContext);

  const { sab, view } = useMemo(() => {
    // 4 * 4
    const sab = new SharedArrayBuffer(16);
    const view = new Float32Array(sab);
    return { sab, view };
  }, []);

  const _style = useMemo(
    () =>
      parentRenderTargetCtx.root
        ? {
            ...style,
            width: ctx.size[0] / ctx.pixelRatio,
            height: ctx.size[1] / ctx.pixelRatio,
            position: "absolute" as const,
            left: 0,
            top: 0,
          }
        : style,
    [style]
  );

  const renderTargetCtx = useMemo(() => {
    // "cameraProjectionMatrix",
    const bCameraProjectionMatrix = createUniformBinding("mat4");
    // "cameraViewMatrix"
    const bCameraViewMatrix = createUniformBinding("mat4");

    bCameraProjectionMatrix.update(emptyMatrix.elements);
    bCameraViewMatrix.update(emptyMatrix.elements);

    const allBindings = {
      cameraProjectionMatrix: bCameraProjectionMatrix.resource,
      cameraViewMatrix: bCameraViewMatrix.resource,
      ...bindings.resources,
    } as Record<string, TransferResource>;

    renderCtx.renderTargets.set(id, {
      bindings: allBindings,
    });

    for (let name in allBindings) {
      const bind = allBindings[name];
      let type;
      if (bind.type === "texture") {
        if (bind.sampleType === "uint") {
          type = "uintTexture" as const;
        } else if (bind.sampleType === "sint") {
          type = "sintTexture" as const;
        } else {
          type = "sampledTexture" as const;
        }
      } else {
        type = bind.type;
      }
      renderCtx.renderTargetBindGroupLayout[name] = type;
    }

    return { bindings: allBindings, root: false };
  }, []);

  useMemo(() => {
    const textures: Record<string, Texture> = {};
    const binds: TransferBinding[] = [];
    for (let name in renderTargetCtx.bindings) {
      const index = getOrcreateSlot("target", name);
      const resource = renderTargetCtx.bindings[name];
      binds.push({
        name,
        binding: index,
        resource,
      });

      let type;
      if (resource.type === "texture") {
        if (resource.sampleType === "uint") {
          type = "uintTexture" as const;
        } else if (resource.sampleType === "sint") {
          type = "sintTexture" as const;
        } else {
          type = "sampledTexture" as const;
        }
      } else {
        type = resource.type;
      }
      renderCtx.renderTargetBindGroupLayout[name] = type;

      if (resource.type === "texture") {
        const texture = TextureManager.get(resource.textureId);
        if (!texture) {
          throw new Error(`Missing texture ${resource.textureId}`);
        }
        textures[name] = texture;
      }
    }

    renderCtx.server.createRenderTarget({
      id,
      viewport: sab,
      bindings: binds,
      textures,
    });
  }, []);

  useEffect(() => {
    return () => {
      renderCtx.server.removeRenderTarget(id);
    };
  }, []);

  return (
    <RenderTargetContext.Provider value={renderTargetCtx}>
      {camera}
      {light}
      <yoga
        style={_style}
        onLayout={(node) => {
          const layout = node.getComputedLayout();
          view.set([
            layout.left * ctx.pixelRatio,
            layout.top * ctx.pixelRatio,
            layout.width * ctx.pixelRatio,
            layout.height * ctx.pixelRatio,
          ]);
        }}
      >
        {children}
      </yoga>
    </RenderTargetContext.Provider>
  );
}
