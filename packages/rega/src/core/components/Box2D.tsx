import React, { useEffect, useMemo } from "react";
import {
  //uv,
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

import createMaterial from "../render/createMaterial";
import createVertexHandle from "../render/createVertexHandle";
import createIndexHandle from "../render/createIndexHandle";
import createBindingHandle from "../render/createBindingHandle";

import RenderObject from "../primitives/RenderObject";

import { createPlaneGeometry } from "../tools/geometry";

import useAnchor, { AnchorType } from "../hooks/useAnchor";
import Relative from "../primitives/Relative";
import { parseColor } from "../tools/color";

interface Props {
  size: [number, number];
  anchor?: AnchorType;
  color?: string;
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

const material = createMaterial(
  modelWorldMatrix.mul(positionGeometry),
  vec4(color, opacity)
);

const { vertices, vertexCount, indices } = createPlaneGeometry();

const vertexHandle = createVertexHandle(material, vertexCount);
vertexHandle.update("position", vertices);

const indexHandle = createIndexHandle(indices.length);
indexHandle.update(indices);

export default React.memo(function Box2D({
  size,
  anchor = "center",
  color = "white",
}: Props) {
  const bindingHandle = useMemo(() => createBindingHandle(material), []);

  useEffect(() => {
    const { opacity, array } = parseColor(color);
    bindingHandle.update("opacity", [opacity]);
    bindingHandle.update("color", array);
  }, [color]);

  const anchorMatrix = useAnchor(anchor, size);

  const matrix = useMemo(() => {
    const mat = new Matrix4();
    mat.makeScale(size[0], size[1], 1);
    mat.premultiply(anchorMatrix);
    return mat;
  }, [anchorMatrix, size.join(",")]);

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
});
