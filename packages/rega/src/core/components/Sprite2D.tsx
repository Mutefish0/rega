import React, { useEffect, useMemo, useContext } from "react";

import {
  vec4,
  texture,
  positionGeometry,
  uniform,
  modelWorldMatrix,
  Matrix4,
} from "pure3";

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

//const color = uniform(new Vector3(0, 0, 0), "vec3").label("color");
//const opacity = uniform(1, "float").label("opacity");

const color = uniform("vec3").label("color");
const opacity = uniform("float").label("opacity");

// const material = createMaterial(
//   cameraProjectionMatrix
//     .mul(cameraViewMatrix)
//     .mul(modelWorldMatrix)
//     .mul(positionGeometry),
//   vec4(color, opacity)
// );

await TextureManager.add("/images/atlas.png");

const tex = texture(TextureManager.get("/images/atlas.png")!.texture3).label(
  "tex"
);

// tex.uvNode = varying(uv());

const material = createMaterial(
  modelWorldMatrix.mul(positionGeometry),
  //tex
  //vec4(color, opacity)
  tex.mul(vec4(color, opacity))
);

const { vertices, vertexCount, indices, uvs } = createPlaneGeometry();

const indexHandle = createIndexHandle(indices.length);
indexHandle.update(indices);

// 不支持更换 Texture，但是支持编辑
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

  const vertexHandle = useMemo(() => {
    const vertexHandle = createVertexHandle(material, vertexCount);
    vertexHandle.update("position", vertices);
    return vertexHandle;
  }, []);

  const { bindingHandle, width, height } = useMemo(() => {
    const t = TextureManager.get(textureId)!;
    return {
      bindingHandle: createBindingHandle(material, {
        textures: {
          tex: {
            buffer: t.sab,
            width: t.width,
            height: t.height,
          },
        },
      }),
      width: t.width,
      height: t.height,
    };
  }, []);

  useEffect(() => {
    const { opacity: opacity1, array } = parseColor(color || "#fff");
    bindingHandle.update("opacity", [opacity ?? opacity1]);
    bindingHandle.update("color", array);
  }, [color, opacity]);

  useEffect(() => {
    const cWidth = (clip[2] - 2 * padding) / width;
    const cHeight = (clip[3] - 2 * padding) / height;
    const cLeftTop = [
      (clip[0] + padding) / width,
      (clip[1] + padding) / height,
    ];

    vertexHandle.update("uv", [
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
    ]);
  }, [clip.join(","), width, height]);

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
    const matRZ = new Matrix4();
    const matT = new Matrix4();

    matRX.makeRotationX(Math.PI);

    //matRY.makeRotationY(Math.PI);

    //matRZ.makeRotationZ(Math.PI / 3);

    // if (rotation) {
    //   matRX.makeRotationX(rotation.x);
    //   matRY.makeRotationY(rotation.y);
    //   matRZ.makeRotationZ(rotation.z);
    // }

    // if (flipY) {
    //   mat.makeRotationX(Math.PI);
    // }
    // if (flipX) {
    //   mat.makeRotationY(Math.PI);
    // }

    //mat.makeRotationX(Math.PI / 3);

    mat.makeScale(scale[0], scale[1], 1);

    // mat
    //   //.premultiply(anchorMatrix)
    //   .multiply(matRZ)
    //   .multiply(matRY)
    //   .multiply(matRX);
    //return mat.multiply(matRX);

    //matRX

    return mat.premultiply(anchorMatrix).multiply(matRX);

    //return matRX.multiply(anchorMatrix).multiply(mat);
  }, [anchorMatrix, scale.join(","), flipX, flipY]);

  return (
    <Relative matrix={matrix}>
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

  // const ctx = useContext(ThreeContext);
  // const bindingHandle = useMemo(() => {
  //   const t = TextureManager.get(textureId)!;
  //   return createBindingHandle(material, {
  //     textures: {
  //       tex: {
  //         buffer: t.sab,
  //         width: t.width,
  //         height: t.height,
  //       },
  //     },
  //   });
  // }, []);
  // useEffect(() => {
  //   const { opacity: opacity1, array } = parseColor(color || "#fff");
  //   bindingHandle.update("opacity", [opacity ?? opacity1]);
  //   bindingHandle.update("color", array);
  // }, [color, opacity]);
  // const scale = useMemo(() => {
  //   if (size) {
  //     return size;
  //   }
  //   const cWidth = clip[2] / ctx.assetsPixelRatio;
  //   const cHeight = clip[3] / ctx.assetsPixelRatio;
  //   return [cWidth, cHeight, 1] as [number, number, number];
  // }, [size, ctx.assetsPixelRatio]);
  // // const { geometry, material } = useMemo(() => {
  // //   const geometry = new PlaneGeometry(scale[0], scale[1]);
  // //   const material = new MeshBasicMaterial({
  // //     color: 0xffffff,
  // //     transparent: true,
  // //     side: DoubleSide,
  // //   });
  // //   return {
  // //     geometry,
  // //     material,
  // //   };
  // // }, []);
  // const { texture, width, height } = useMemo(() => {
  //   const texture = TextureManager.get(textureId)!;
  //   const { width, height } = texture;
  //   return { texture, width, height };
  // }, [textureId]);
  // const anchorMatrix = useAnchor(anchor, [scale[0], scale[1]]);
  // const matrix = useMemo(() => {
  //   const mat = new Matrix4();
  //   // if (flipY) {
  //   //   mat.makeRotationX(Math.PI);
  //   // }
  //   // if (flipX) {
  //   //   mat.makeRotationY(Math.PI);
  //   // }
  //   mat.makeScale(...scale);
  //   mat.premultiply(anchorMatrix);
  //   return mat;
  // }, [anchorMatrix, scale.join(","), flipX, flipY]);
  // // useEffect(() => {
  // //   material.map = texture;
  // //   if (alphaTextureId) {
  // //     material.alphaMap = TextureManager.get(alphaTextureId)!;
  // //   }
  // // }, [texture, alphaTextureId]);
  // // useEffect(() => {
  // //   const cWidth = (clip[2] - 2 * padding) / width;
  // //   const cHeight = (clip[3] - 2 * padding) / height;
  // //   const cLeftTop = [
  // //     (clip[0] + padding) / width,
  // //     1 - (clip[1] + padding) / height,
  // //   ];
  // //   geometry.attributes.uv.setXY(0, cLeftTop[0], cLeftTop[1]);
  // //   geometry.attributes.uv.setXY(1, cLeftTop[0] + cWidth, cLeftTop[1]);
  // //   geometry.attributes.uv.setXY(2, cLeftTop[0], cLeftTop[1] - cHeight);
  // //   geometry.attributes.uv.setXY(
  // //     3,
  // //     cLeftTop[0] + cWidth,
  // //     cLeftTop[1] - cHeight
  // //   );
  // //   geometry.attributes.uv.needsUpdate = true;
  // // }, [clip.join(","), width, height]);
  // return (
  //   <Relative matrix={matrix}>
  //     <RenderObject
  //       material={material}
  //       input={{
  //         vertexBuffers: vertexHandle.buffers,
  //         vertexCount,
  //         index: {
  //           indexBuffer: indexHandle.buffer,
  //           indexCount: indices.length,
  //         },
  //       }}
  //       bindingHandle={bindingHandle}
  //     />
  //   </Relative>
  // );
});
