import React, { useEffect, useMemo } from "react";

import Mesh from "../primitives/Mesh";
import useAnchor, { AnchorType } from "../hooks/useAnchor";
import Relative from "../primitives/Relative";
import { parseColor } from "../tools/color";
import { PlaneGeometry, MeshBasicMaterial, Matrix4 } from "three/webgpu";

interface Props {
  size: [number, number];
  anchor?: AnchorType;
  color?: string;
}

export default React.memo(function Box2D({
  size,
  anchor = "center",
  color = "white",
}: Props) {
  const { geometry, material } = useMemo(() => {
    const geometry = new PlaneGeometry(1, 1);

    const material = new MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
    });

    return {
      geometry,
      material,
    };
  }, []);

  const anchorMatrix = useAnchor(anchor, size);

  const matrix = useMemo(() => {
    const mat = new Matrix4();
    mat.makeScale(size[0], size[1], 1);
    mat.premultiply(anchorMatrix);
    return mat;
  }, [anchorMatrix, size.join(",")]);

  useEffect(() => {
    const { opacity, array } = parseColor(color);
    material.color.setRGB(array[0], array[1], array[2]);
    material.opacity = opacity;
    material.needsUpdate = true;
  }, [color]);

  return (
    <Relative matrix={matrix}>
      <Mesh geometry={geometry} material={material} />
    </Relative>
  );
});
