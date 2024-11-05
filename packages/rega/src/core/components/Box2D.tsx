import React, { useEffect, useMemo } from "react";
import {
  positionGeometry,
  vec4,
  uniform,
  modelWorldMatrix,
  Matrix4,
  cameraProjectionMatrix,
  cameraViewMatrix,
} from "pure3";

import createIndexHandle from "../render/createIndexHandle";

import {
  BindingContextProvider,
  useBinding,
} from "../primitives/BindingContext";

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

const vertexNode = cameraProjectionMatrix
  .mul(cameraViewMatrix)
  .mul(modelWorldMatrix)
  .mul(vec4(positionGeometry, 1));

//const vertexNode = modelWorldMatrix.mul(vec4(positionGeometry, 1));

const fragmentNode = vec4(color, opacity);

// // const material = createMaterial(
// //   cameraProjectionMatrix
// //     .mul(cameraViewMatrix)
// //     .mul(modelWorldMatrix)
// //     .mul(positionGeometry),
// //   vec4(color, opacity)
// // );

// const material = createMaterial(
//   modelWorldMatrix.mul(vec4(positionGeometry, 1)),
//   vec4(color, opacity)
// );

const { vertices, vertexCount, indices } = createPlaneGeometry();

const attributes = {
  position: vertices,
};
const sharedVertexKey = crypto.randomUUID();

const indexHandle = createIndexHandle(indices.length);
indexHandle.update(indices);

export default React.memo(function Box2D({
  size,
  anchor = "center",
  color = "white",
}: Props) {
  const bOpacity = useBinding("float");
  const bColor = useBinding("vec3");

  useEffect(() => {
    const { opacity, array } = parseColor(color || "#fff");
    bOpacity.update([opacity]);
    bColor.update(array);
  }, [color, opacity]);

  const anchorMatrix = useAnchor(anchor, size);

  const matrix = useMemo(() => {
    const mat = new Matrix4();
    mat.makeScale(size[0], size[1], 1);
    mat.premultiply(anchorMatrix);
    return mat;
  }, [anchorMatrix, size.join(",")]);

  const bindings = useMemo(
    () => ({
      color: bColor.resource,
      opacity: bOpacity.resource,
    }),
    []
  );

  return (
    <Relative matrix={matrix}>
      <BindingContextProvider value={bindings}>
        <RenderObject
          vertexNode={vertexNode}
          fragmentNode={fragmentNode}
          input={{
            sharedVertexKey,
            attributes,
            vertexCount,
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
