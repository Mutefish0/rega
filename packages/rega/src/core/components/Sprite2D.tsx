import React, { useEffect, useMemo, useContext } from "react";

import {
  vec4,
  texture,
  positionGeometry,
  uniform,
  modelWorldMatrix,
  Matrix4,
  cameraProjectionMatrix,
  cameraViewMatrix,
} from "pure3";

import TextureManager from "../common/texture_manager";
import ThreeContext from "../primitives/ThreeContext";
import {
  BindingContextProvider,
  useBindings,
} from "../primitives/BindingContext";

import { createPlaneGeometry } from "../tools/geometry";

import createIndexHandle from "../render/createIndexHandle";

import RenderObject from "../primitives/RenderObject";

import useAnchor, { AnchorType } from "../hooks/useAnchor";
import Relative from "../primitives/Relative";
import { parseColor } from "../tools/color";

interface Props {
  textureId: string;
  alphaTextureId?: string;
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

const vertexNode = cameraProjectionMatrix
  .mul(cameraViewMatrix)
  .mul(modelWorldMatrix)
  .mul(vec4(positionGeometry, 1));

const fragmentNode = tex.mul(vec4(color, opacity));

const fragmentNodeWithAlpha = tex.mul(vec4(color, opacity.mul(texAlpha.a)));

const { vertices, vertexCount, indices } = createPlaneGeometry();

const indexHandle = createIndexHandle(indices.length);
indexHandle.update(indices);

// TODO 支持复用 Vertex
export default React.memo(function Sprite2D({
  textureId,
  clip,
  anchor = "center",
  flipX = false,
  flipY = false,
  opacity,
  padding = 0,
  color,
  size = [1, 1],
  alphaTextureId,
}: Props) {
  const ctx = useContext(ThreeContext);

  const texture = useMemo(() => {
    return TextureManager.get(textureId)!;
  }, [textureId]);

  const bindings = useBindings({
    opacity: "float",
    color: "vec3",
    tex: {
      type: "texture_2d",
      textureId,
    },
    texAlpha: {
      type: "texture_2d",
      textureId: alphaTextureId,
    },
  });

  useEffect(() => {
    const { opacity: opacity1, array } = parseColor(color || "#fff");
    bindings.updates.opacity([opacity ?? opacity1]);
    bindings.updates.color(array);
  }, [color, opacity]);

  const uvs = useMemo(() => {
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

    return uvs;
  }, [clip.join(","), texture]);

  const anchorMatrix = useAnchor(anchor, size);

  const scale = useMemo(() => {
    if (size) {
      return size;
    }
    const cWidth = clip[2] / ctx.assetsPixelRatio;
    const cHeight = clip[3] / ctx.assetsPixelRatio;
    return [cWidth, cHeight, 1] as [number, number, number];
  }, [size, ctx.assetsPixelRatio]);

  const matrix = useMemo(() => {
    const mat = new Matrix4();

    const matRX = new Matrix4();
    const matRY = new Matrix4();

    if (flipY) {
      matRX.makeRotationX(Math.PI);
    }
    if (flipX) {
      matRY.makeRotationY(Math.PI);
    }

    mat.makeScale(scale[0], scale[1], 1);
    mat.premultiply(anchorMatrix).multiply(matRY).multiply(matRX);
    return mat;
  }, [anchorMatrix, scale.join(","), flipX, flipY]);

  const attributes = useMemo(() => {
    return {
      position: vertices,
      uv: uvs,
    };
  }, [uvs]);

  return (
    <Relative matrix={matrix}>
      <BindingContextProvider value={bindings.resources}>
        <RenderObject
          vertexNode={vertexNode}
          fragmentNode={alphaTextureId ? fragmentNodeWithAlpha : fragmentNode}
          input={{
            vertexCount,
            attributes,
            index: {
              indexBuffer: indexHandle.buffer,
              indexCount: indices.length,
            },
          }}
        />
      </BindingContextProvider>
    </Relative>
  );
});
