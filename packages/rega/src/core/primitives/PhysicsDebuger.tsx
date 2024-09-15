import React, { useContext, useEffect, useMemo } from "react";
import PhysicsContext from "./PhysicsContext";
import ThreeContext from "./ThreeContext";
import {
  BufferGeometry,
  LineBasicMaterial,
  LineSegments,
  BufferAttribute,
  AlwaysDepth,
} from "three/webgpu";
import { useAfterPhysicsFrame } from "../primitives/Physics";

// max debug vertices
const MAX_POINTS = 1000;

export default React.memo(function PhysicsDebuger() {
  const ctx = useContext(PhysicsContext);
  const context = useContext(ThreeContext);

  const { geometry, positionAttribute, colorAttribute } = useMemo(() => {
    const geometry = new BufferGeometry();

    const positionAttribute = new BufferAttribute(
      new Float32Array(MAX_POINTS * 3),
      3
    );
    const colorAttribute = new BufferAttribute(
      new Float32Array(MAX_POINTS * 4),
      4
    );

    geometry.setAttribute("position", positionAttribute);
    geometry.setAttribute("color", colorAttribute);

    return { geometry, positionAttribute, colorAttribute };
  }, []);

  useAfterPhysicsFrame(() => {
    const { vertices, colors } = ctx.debugRender() as {
      vertices: number[];
      colors: number[];
    };
    let i = 0;
    for (; i < vertices.length; i += 2) {
      positionAttribute.setXYZ(i / 2, vertices[i], vertices[i + 1], 0);
    }
    geometry.setDrawRange(0, i / 2);
    positionAttribute.needsUpdate = true;

    for (let i = 0; i < colors.length; i += 4) {
      colorAttribute.setXYZW(
        i / 4,
        colors[i],
        colors[i + 1],
        colors[i + 2],
        colors[i + 3]
      );
    }
    colorAttribute.needsUpdate = true;
  }, []);

  useEffect(() => {
    const lines = new LineSegments(
      geometry,
      new LineBasicMaterial({
        linewidth: 1,
        vertexColors: true,
        transparent: true,
      })
    );
    context.scene.add(lines);
    lines.frustumCulled = false;
    lines.renderOrder = 9999;

    return () => {
      context.scene.remove(lines);
      lines.material.dispose();
      lines.geometry.dispose();
    };
  }, []);

  return null;
});
