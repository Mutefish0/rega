import React, { useEffect, useMemo, useContext } from "react";
import {
  varying,
  uv,
  texture,
  normalGeometry,
  normalLocal,
  positionGeometry,
  vec4,
  uniform,
  modelWorldMatrix,
  cameraProjectionMatrix,
  cameraViewMatrix,
} from "three/src/nodes/TSL.js";

import { Vector3, Matrix4 } from "three/tsl";

import TextureManager from "../common/texture_manager";
import ThreeContext from "../primitives/ThreeContext";

import { createPlaneGeometry } from "../tools/geometry";

import createMaterial from "../render/createMaterial";
import createVertexHandle from "../render/createVertexHandle";
import createIndexHandle from "../render/createIndexHandle";
import createBindingHandle from "../render/createBindingHandle";

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

const color = uniform(new Vector3(0, 0, 0), "vec3").label("color");
const opacity = uniform(1, "float").label("opacity");

// const material = createMaterial(
//   cameraProjectionMatrix
//     .mul(cameraViewMatrix)
//     .mul(modelWorldMatrix)
//     .mul(positionGeometry),
//   vec4(color, opacity)
// );

await TextureManager.add("/images/atlas.png");

const tex = texture(TextureManager.get("/images/atlas.png"));
tex.uvNode = varying(uv());

const material = createMaterial(
  modelWorldMatrix.mul(positionGeometry),
  tex.mul(vec4(color, opacity))
);

const { vertices, vertexCount, indices } = createPlaneGeometry();

const vertexHandle = createVertexHandle(material, vertexCount);
vertexHandle.update("position", vertices);

const indexHandle = createIndexHandle(indices.length);
indexHandle.update(indices);

export default React.memo(function Sprite2D({
  textureId,
  clip,
  anchor = "center",
  flipX = false,
  flipY = false,
  opacity,
  padding = 0,
  color,
  size,
  alphaTextureId,
}: Props) {
  const ctx = useContext(ThreeContext);

  const bindingHandle = useMemo(() => createBindingHandle(material), []);

  const scale = useMemo(() => {
    if (size) {
      return size;
    }
    const cWidth = clip[2] / ctx.assetsPixelRatio;
    const cHeight = clip[3] / ctx.assetsPixelRatio;
    return [cWidth, cHeight, 1] as [number, number, number];
  }, [size, ctx.assetsPixelRatio]);

  // const { geometry, material } = useMemo(() => {
  //   const geometry = new PlaneGeometry(scale[0], scale[1]);

  //   const material = new MeshBasicMaterial({
  //     color: 0xffffff,
  //     transparent: true,
  //     side: DoubleSide,
  //   });

  //   return {
  //     geometry,
  //     material,
  //   };
  // }, []);

  const { texture, width, height } = useMemo(() => {
    const texture = TextureManager.get(textureId)!;
    const { width, height } = texture!.image!;
    return { texture, width, height };
  }, [textureId]);

  const anchorMatrix = useAnchor(anchor, [scale[0], scale[1]]);

  const translation = useMemo(() => {
    const v = new Vector3();
    v.applyMatrix4(anchorMatrix);
    return v;
  }, [anchorMatrix]);

  // useEffect(() => {
  //   material.map = texture;
  //   if (alphaTextureId) {
  //     material.alphaMap = TextureManager.get(alphaTextureId)!;
  //   }
  // }, [texture, alphaTextureId]);

  // useEffect(() => {
  //   const { opacity, array } = parseColor(color || "#ffffff");
  //   material.opacity = opacity;
  //   material.color.setRGB(array[0], array[1], array[2]);
  //   material.needsUpdate = true;
  // }, [color]);

  // useEffect(() => {
  //   const cWidth = (clip[2] - 2 * padding) / width;
  //   const cHeight = (clip[3] - 2 * padding) / height;
  //   const cLeftTop = [
  //     (clip[0] + padding) / width,
  //     1 - (clip[1] + padding) / height,
  //   ];

  //   geometry.attributes.uv.setXY(0, cLeftTop[0], cLeftTop[1]);
  //   geometry.attributes.uv.setXY(1, cLeftTop[0] + cWidth, cLeftTop[1]);
  //   geometry.attributes.uv.setXY(2, cLeftTop[0], cLeftTop[1] - cHeight);
  //   geometry.attributes.uv.setXY(
  //     3,
  //     cLeftTop[0] + cWidth,
  //     cLeftTop[1] - cHeight
  //   );
  //   geometry.attributes.uv.needsUpdate = true;
  // }, [clip.join(","), width, height]);

  // useEffect(() => {
  //   material.opacity = opacity ?? 1;
  // }, [opacity]);

  return (
    <Relative
      translation={translation}
      rotation={{
        x: flipY ? Math.PI : 0,
        y: flipX ? Math.PI : 0,
        z: 0,
      }}
    >
      <RenderObject
        material={material}
        input={{
          vertexBuffers: vertexHandle.buffers,
          vertexCount,
          index: {
            indexBuffer: indexHandle.buffer,
            indexCount: indices.length,
          },
        }}
        bindingHandle={bindingHandle}
      />
    </Relative>
  );
});
