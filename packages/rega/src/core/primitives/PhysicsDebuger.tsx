import React, { useContext, useState } from "react";
import PhysicsContext from "./PhysicsContext";

import {
  cameraProjectionMatrix,
  cameraViewMatrix,
  modelWorldMatrix,
  positionGeometry,
  vec4,
  attribute,
} from "pure3";

import RenderObject from "./RenderObject";
import useVertexBindings from "../hooks/useVertexBindings";
import { useAfterPhysicsFrame } from "../primitives/Physics";

const vertexNode = cameraProjectionMatrix
  .mul(cameraViewMatrix)
  .mul(modelWorldMatrix)
  .mul(vec4(positionGeometry, 1));

const fragmentNode = attribute("vec4", "color");

// max debug vertices
const MAX_POINTS = 5000;

export default React.memo(function PhysicsDebuger() {
  const ctx = useContext(PhysicsContext);
  const [vertexCount, setVertexCount] = useState(0);

  const vertexBindings = useVertexBindings(
    {
      position: "vec3",
      color: "vec4",
    },
    MAX_POINTS
  );

  useAfterPhysicsFrame(() => {
    const { vertices, colors } = ctx.debugRender() as {
      vertices: number[];
      colors: number[];
    };
    const vertexCount = Math.floor(vertices.length / 2);
    for (let i = 0; i < vertexCount; i++) {
      let base = i * 2;
      vertexBindings.updates.position(
        [vertices[base], vertices[base + 1], 0],
        i * 3,
        false
      );
      base = i * 4;
      vertexBindings.updates.color(
        [colors[base], colors[base + 1], colors[base + 2], colors[base + 3]],
        i * 4,
        false
      );
    }

    // commit
    vertexBindings.updates.position([]);
    vertexBindings.updates.color([]);

    setVertexCount(vertexCount);
  }, []);

  return (
    <RenderObject
      vertex={vertexBindings.buffers}
      vertexCount={vertexCount}
      vertexNode={vertexNode}
      fragmentNode={fragmentNode}
      topology="line-list"
      zIndexEnabled
    />
  );
});
