import React, { useEffect, useMemo } from "react";
import {
  positionGeometry,
  vec4,
  uniform,
  modelWorldMatrix,
  Matrix4,
} from "pure3";

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

const color = uniform("vec3", "color");
const opacity = uniform("float", "opacity");

// const material = createMaterial(
//   cameraProjectionMatrix
//     .mul(cameraViewMatrix)
//     .mul(modelWorldMatrix)
//     .mul(positionGeometry),
//   vec4(color, opacity)
// );

const material = createMaterial(
  modelWorldMatrix.mul(vec4(positionGeometry, 1)),
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
