import React, { useEffect, useMemo } from "react";
import Relative from "../../primitives/Relative";
import {
  positionGeometry,
  vec4,
  texture,
  modelWorldMatrix,
  cameraProjectionMatrix,
  cameraViewMatrix,
  Matrix4,
  uniform,
} from "pure3";

import quad from "../../render/geometry/quad";

import useBindings from "../../hooks/useBingdings";

import RenderObject from "../../primitives/RenderObject";

const tex = texture("tex");
const opacity = uniform("float", "opacity");

const vertexNode = cameraProjectionMatrix
  .mul(cameraViewMatrix)
  .mul(modelWorldMatrix)
  .mul(vec4(positionGeometry, 1));

const fragmentNode = vec4(tex.rgb, tex.a.mul(opacity));

interface Props {
  size: [number, number];
  src: string;
  opacity?: number;
}

export default function Image({ src, size, opacity = 1 }: Props) {
  const bindings = useBindings(
    { tex: "texture_2d", opacity: "float" },
    (init) => {
      init.tex(src);
      init.opacity([opacity]);
    }
  );

  useEffect(() => {
    bindings.updates.opacity([opacity]);
  }, [opacity]);

  const matrix = useMemo(() => {
    const mat = new Matrix4();
    mat.makeScale(size[0], size[1], 1);
    mat.makeTranslation(size[0] / 2, -size[1] / 2, 0);
    return mat;
  }, [size.join(",")]);

  return (
    <Relative matrix={matrix}>
      <RenderObject
        bindings={bindings.resources}
        vertexNode={vertexNode}
        fragmentNode={fragmentNode}
        index={quad.index}
        vertex={quad.vertex}
        vertexCount={quad.vertexCount}
        zIndexEnabled
      />
    </Relative>
  );
}
