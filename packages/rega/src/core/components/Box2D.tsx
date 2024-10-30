import React, { useEffect, useMemo } from "react";
import {
  uv,
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

export function createPlaneGeometry(width = 1, height = 1) {
  const width_half = width / 2;
  const height_half = height / 2;

  const widthSegments = 1;
  const heightSegments = 1;

  const gridX = Math.floor(widthSegments);
  const gridY = Math.floor(heightSegments);

  const gridX1 = gridX + 1;
  const gridY1 = gridY + 1;

  const segment_width = width / gridX;
  const segment_height = height / gridY;

  const indices = [];
  const vertices = [];
  const normals = [];
  const uvs = [];

  let vertexCount = 0;

  for (let iy = 0; iy < gridY1; iy++) {
    const y = iy * segment_height - height_half;

    for (let ix = 0; ix < gridX1; ix++) {
      const x = ix * segment_width - width_half;

      vertices.push(x, -y, 0);

      vertexCount++;

      normals.push(0, 0, 1);

      uvs.push(ix / gridX);
      uvs.push(1 - iy / gridY);
    }
  }

  for (let iy = 0; iy < gridY; iy++) {
    for (let ix = 0; ix < gridX; ix++) {
      const a = ix + gridX1 * iy;
      const b = ix + gridX1 * (iy + 1);
      const c = ix + 1 + gridX1 * (iy + 1);
      const d = ix + 1 + gridX1 * iy;

      indices.push(a, b, d);
      indices.push(b, c, d);
    }
  }

  return {
    vertices,
    indices,
    normals,
    uvs,
    vertexCount,
  };
}

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
            indexFormat: "uint16",
            indexCount: indices.length,
          },
        }}
        bindingHandle={bindingHandle}
      />
    </Relative>
  );
});
