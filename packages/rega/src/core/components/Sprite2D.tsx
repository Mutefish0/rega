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

import { createPlaneGeometry } from "../tools/geometry";

import createVertexHandle from "../render/createVertexHandle";
import createIndexHandle from "../render/createIndexHandle";

import { BindingContextProvider } from "../primitives/BindingContext";

import { createUniformBinding } from "../../core/render/binding";

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

// const vertexNode = cameraProjectionMatrix
//   .mul(cameraViewMatrix)
//   .mul(modelWorldMatrix)
//   .mul(vec4(positionGeometry, 1));

const vertexNode = modelWorldMatrix.mul(vec4(positionGeometry, 1));


const fragmentNode = vec4(color, opacity);
//const fragmentNode = tex.mul(vec4(color, opacity));

const { vertices, vertexCount, indices } = createPlaneGeometry();

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

  const texture = useMemo(() => {
    return TextureManager.get(textureId)!;
  }, [textureId]);

  const bOpacity = useMemo(() => createUniformBinding("float"), []);
  const bColor = useMemo(() => createUniformBinding("vec3"), []);

  useEffect(() => {
    const { opacity: opacity1, array } = parseColor(color || "#fff");
    bOpacity.update([opacity ?? opacity1]);
    bColor.update(array);
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
    const matRZ = new Matrix4();
    const matT = new Matrix4();

    matRX.makeRotationX(Math.PI - 0.00001);

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

  const bindings = useMemo(
    () => ({
      tex: {
        type: "sampledTexture" as const,
        buffer: texture.sab,
        width: texture.width,
        height: texture.height,
      },
      tex_sampler: {
        type: "sampler" as const
      },
      color: bColor.resource,
      opacity: bOpacity.resource,
    }),
    []
  );

  const attributes = useMemo(() => {
    return {
      position: vertices,
      uvs,
    };
  }, [uvs]);

  return (
    <Relative matrix={matrix}>
      <BindingContextProvider value={bindings}>
        <RenderObject
          vertexNode={vertexNode}
          fragmentNode={fragmentNode}
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
