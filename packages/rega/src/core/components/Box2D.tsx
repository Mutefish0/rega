import React, { useEffect, useMemo } from "react";
import { vec4, uniform, Matrix4, positionGeometry } from "pure3";

import quad from "../render/geometry/quad";
import { basicVertexNode } from "../render/shaders/index";
import useBindings from "../hooks/useBingdings";

import RenderObject from "../primitives/RenderObject";

import useAnchor, { AnchorType } from "../hooks/useAnchor";
import Relative from "../primitives/Relative";
import { parseColor } from "../tools/color";

interface Props {
  size: [number, number];
  anchor?: AnchorType;
  color?: string;
  opacity?: number;
}

const color = uniform("vec3", "color");
const opacity = uniform("float", "opacity");

const fragmentNode = vec4(color, opacity);

export default React.memo(function Box2D({
  size,
  anchor = "center",
  color: colorValue = "white",
  opacity: opacityValue = 1,
}: Props) {
  const bindings = useBindings({
    opacity: "float",
    color: "vec3",
  });

  useEffect(() => {
    const { opacity, array } = parseColor(colorValue || "#fff");
    bindings.updates.opacity([opacityValue * opacity]);
    bindings.updates.color(array);
  }, [color, opacityValue]);

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
        colorNode={color}
        material={{
          opacity: opacity,
        }}
        vertexCount={quad.vertexCount}
        vertex={quad.vertex}
        index={quad.index}
        bindings={bindings.resources}
        zIndexEnabled
        depthWriteEnabled
      />
    </Relative>
  );
});
