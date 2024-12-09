import React, { useEffect, useMemo } from "react";
import { uniform, vec4, Matrix4 } from "pure3";

import RenderObject from "../primitives/RenderObject";
import { basicVertexNode } from "../render/shaders/index";
import cube from "../render/geometry/cube";

import useBindings from "../hooks/useBingdings";
import Relative from "../primitives/Relative";
import { parseColor } from "../tools/color";

import { lambertDiffuse } from "../render/shaders/lambert";
const albedo = uniform("vec3", "albedo");

const lightDir = uniform("vec3", "directionalLight_direction");
const lightIntensity = uniform("float", "directionalLight_intensity");

const opacity = uniform("float", "opacity");

const diffuse = lambertDiffuse({ lightDir, lightIntensity });
const fragmentNode = vec4(albedo.mul(diffuse), opacity);

interface Props {
  size: [number, number, number];
  //anchor?: AnchorType;
  color?: string;
  opacity?: number;
}

export default function Box3D({
  opacity: opacityValue = 1,
  color,
  //anchor = "center",
  size,
}: Props) {
  const bindings = useBindings({
    opacity: "float",
    albedo: "vec3",
  });

  const matrix = useMemo(() => {
    const mat = new Matrix4();
    mat.makeScale(size[0], size[1], size[2] ?? 1);
    //mat.premultiply(anchorMatrix);
    return mat;
  }, [size.join(",")]);

  useEffect(() => {
    const { opacity, array } = parseColor(color || "#fff");
    bindings.updates.opacity([opacityValue * opacity]);
    bindings.updates.albedo(array);
  }, [color, opacityValue]);

  return (
    <Relative matrix={matrix}>
      <RenderObject
        bindings={bindings.resources}
        fragmentNode={fragmentNode}
        vertexNode={basicVertexNode}
        vertexCount={cube.vertexCount}
        vertex={cube.vertex}
        index={cube.index}
        depthWriteEnabled
        cullMode="back"
      />
    </Relative>
  );
}
