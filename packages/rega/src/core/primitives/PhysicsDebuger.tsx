import React, { useContext, useMemo, useState } from "react";
import PhysicsContext from "./PhysicsContext";

import {
  cameraProjectionMatrix,
  cameraViewMatrix,
  modelWorldMatrix,
  positionGeometry,
  vec4,
  vertexColor,
} from "pure3";

import RenderObject from "./RenderObject";
import { createVertexBinding } from "../render/vertex";
import { useAfterPhysicsFrame } from "../primitives/Physics";

const vertexNode = cameraProjectionMatrix
  .mul(cameraViewMatrix)
  .mul(modelWorldMatrix)
  .mul(vec4(positionGeometry, 1));

const fragmentNode = vertexColor as any;

// max debug vertices
const MAX_POINTS = 1000;

export default React.memo(function PhysicsDebuger() {
  const ctx = useContext(PhysicsContext);
  const [vertexCount, setVertexCount] = useState(0);

  const positionBinding = useMemo(
    () => createVertexBinding("vec3", MAX_POINTS),
    []
  );

  const colorBinding = useMemo(
    () => createVertexBinding("vec4", MAX_POINTS),
    []
  );

  useAfterPhysicsFrame(() => {
    const { vertices, colors } = ctx.debugRender() as {
      vertices: number[];
      colors: number[];
    };
    let i = 0;
    for (; i < vertices.length; i += 2) {
      positionBinding.update([i / 2, vertices[i], vertices[i + 1], 0]);
    }

    for (let i = 0; i < colors.length; i += 4) {
      colorBinding.update([
        i / 4,
        colors[i],
        colors[i + 1],
        colors[i + 2],
        colors[i + 3],
      ]);
    }

    setVertexCount(i / 2);
  }, []);

  const vertex = useMemo(
    () => ({
      position: positionBinding.buffer,
      color: colorBinding.buffer,
    }),
    []
  );

  return (
    <RenderObject
      vertex={vertex}
      vertexCount={vertexCount}
      vertexNode={vertexNode}
      fragmentNode={fragmentNode}
      topology="line-list"
      zIndexEnabled
    />
  );
});
