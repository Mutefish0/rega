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

import quad from "../render/geometry/quad";

import useBindings from "../hooks/useBingdings";

import RenderObject from "../primitives/RenderObject";

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

const fragmentNode = vec4(color, opacity);

export default React.memo(function Box2D({
  size,
  anchor = "center",
  color = "white",
}: Props) {
  const bindings = useBindings({
    opacity: "float",
    color: "vec3",
  });

  useEffect(() => {
    const { opacity, array } = parseColor(color || "#fff");
    bindings.updates.opacity([opacity]);
    bindings.updates.color(array);
  }, [color, opacity]);

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
        vertexNode={vertexNode}
        fragmentNode={fragmentNode}
        vertexCount={quad.vertexCount}
        vertex={quad.vertex}
        index={quad.index}
        bindings={bindings.resources}
        zIndexEnabled
      />
    </Relative>
  );
});
