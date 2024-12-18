import React, { useEffect, useMemo } from "react";
import { uniform, vec4, Matrix4 } from "pure3";

import RenderObject from "../primitives/RenderObject";
import cube from "../render/geometry/cube";

import useBindings from "../hooks/useBingdings";
import Relative from "../primitives/Relative";
import { parseColor } from "../tools/color";

const color = uniform("vec3", "color");
const opacity = uniform("float", "opacity");

interface Props {
  size: [number, number, number];
  //anchor?: AnchorType;
  color?: string;
  opacity?: number;
}

export default function Box3D({
  opacity: opacityValue = 1,
  color: colorValue,
  //anchor = "center",
  size,
}: Props) {
  const bindings = useBindings({
    opacity: "float",
    color: "vec3",
  });

  const matrix = useMemo(() => {
    const mat = new Matrix4();
    mat.makeScale(size[0], size[1], size[2] ?? 1);
    //mat.premultiply(anchorMatrix);
    return mat;
  }, [size.join(",")]);

  useEffect(() => {
    const { opacity, array } = parseColor(colorValue || "#fff");
    bindings.updates.opacity([opacityValue * opacity]);
    bindings.updates.color(array);
  }, [colorValue, opacityValue]);

  return (
    <Relative matrix={matrix}>
      <RenderObject
        bindings={bindings.resources}
        colorNode={color}
        opacityNode={opacity}
        vertexCount={cube.vertexCount}
        vertex={cube.vertex}
        index={cube.index}
        depthWriteEnabled
        cullMode="back"
      />
    </Relative>
  );
}
