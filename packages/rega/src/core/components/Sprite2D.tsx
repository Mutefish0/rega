import React, { useEffect, useMemo, useContext } from "react";

import { luminance, texture, uniform, Matrix4 } from "pure3";

import TextureManager from "../common/texture_manager";
import ThreeContext from "../primitives/ThreeContext";

import RenderObject from "../primitives/RenderObject";
import useAnchor, { AnchorType } from "../hooks/useAnchor";
import Relative from "../primitives/Relative";
import { parseColor } from "../tools/color";

import quad from "../render/geometry/quad";
import useBindings from "../hooks/useBingdings";
import useVertexBinding from "../hooks/useVertexBinding";

interface Props {
  textureId: string;
  alphaTextureId?: string;
  // x,y,width, height
  clip: [number, number, number, number];
  anchor?: AnchorType;
  flipX?: boolean;
  flipY?: boolean;
  opacity?: number;
  padding?: number;
  color?: string;
  size?: [number, number];
}

const color = uniform("vec3", "color");
const opacity = uniform("float", "opacity");
const tex = texture("tex");
const texAlpha = texture("texAlpha");

// TODO 支持复用 Vertex
export default React.memo(function Sprite2D({
  textureId,
  clip,
  anchor = "center",
  flipX = false,
  flipY = false,
  opacity: opacityValue = 1,
  padding = 0,
  color: colorValue,
  size,
  alphaTextureId,
}: Props) {
  const ctx = useContext(ThreeContext);

  const texture = useMemo(() => {
    return TextureManager.get(textureId)!;
  }, [textureId]);

  const bindings = useBindings(
    {
      opacity: "float",
      color: "vec3",
      tex: "texture_2d",
      texAlpha: "texture_2d",
    },
    (init) => {
      init.tex(textureId);
      init.texAlpha(alphaTextureId || textureId);
    }
  );

  const bUv = useVertexBinding("vec2", quad.vertexCount);

  useEffect(() => {
    const { opacity: opacity1, array } = parseColor(colorValue || "#fff");
    bindings.updates.opacity([opacityValue * opacity1]);
    bindings.updates.color(array);
  }, [colorValue, opacityValue]);

  useEffect(() => {
    const { width, height } = texture;
    const cWidth = (clip[2] - 2 * padding) / width;
    const cHeight = (clip[3] - 2 * padding) / height;
    const cLeftTop = [
      (clip[0] + padding) / width,
      (clip[1] + padding) / height,
    ];
    const uvs = [
      cLeftTop[0],
      cLeftTop[1],
      // --
      cLeftTop[0] + cWidth,
      cLeftTop[1],
      // --
      cLeftTop[0],
      cLeftTop[1] + cHeight,
      // --
      cLeftTop[0] + cWidth,
      cLeftTop[1] + cHeight,
    ];
    bUv.update(uvs);
  }, [clip.join(","), texture]);

  const scale = useMemo(() => {
    if (size) {
      return size;
    }
    const cWidth = clip[2] * ctx.assetsPixelToWorldRatio;
    const cHeight = clip[3] * ctx.assetsPixelToWorldRatio;
    return [cWidth, cHeight, 1] as [number, number, number];
  }, [size, ctx.assetsPixelToWorldRatio]);

  const anchorMatrix = useAnchor(anchor, scale);

  const matrix = useMemo(() => {
    const mat = new Matrix4();
    const matScale = new Matrix4();
    const matRX = new Matrix4();
    const matRY = new Matrix4();

    if (flipY) {
      matRX.makeRotationX(Math.PI);
    }

    if (flipX) {
      matRY.makeRotationY(Math.PI);
    }

    matScale.makeScale(scale[0], scale[1], 1);

    mat
      .multiply(anchorMatrix)
      .multiply(matScale)
      .multiply(matRY)
      .multiply(matRX);
    return mat;
  }, [anchorMatrix, scale.join(","), flipX, flipY]);

  return (
    <Relative matrix={matrix}>
      <RenderObject
        colorNode={tex.rgb.mul(color.rgb)}
        opacityNode={texAlpha.a.mul(opacity)}
        alphaTest={alphaTextureId ? luminance(texAlpha.rgb) : undefined}
        bindings={bindings.resources}
        vertexCount={quad.vertexCount}
        vertex={{ position: quad.vertex.position, uv: bUv.buffer }}
        index={quad.index}
        zIndexEnabled
        cullMode="none"
        depthWriteEnabled
      />
    </Relative>
  );
});
