import React, { useEffect, useMemo } from "react";
import RenderObject from "../primitives/RenderObject";
import TextureManager from "../common/texture_manager";
import useVertexBinding from "../hooks/useVertexBinding";
import Relative from "../primitives/Relative";
import quad from "../render/geometry/quad";
import {
  uniform,
  texture,
  cameraProjectionMatrix,
  cameraViewMatrix,
  modelWorldMatrix,
  positionGeometry,
  vec4,
  Matrix4,
  Fn,
  Node,
  max,
  min,
  vec2,
  float,
  smoothstep,
  add,
  sub,
  attribute,
  dpdxFine,
  dpdyFine,
  length,
  inverseSqrt,
  If,
  Discard,
} from "pure3";
import useBindings from "../hooks/useBingdings";
import { parseColor } from "../tools/color";

import useAnchor, { AnchorType } from "../hooks/useAnchor";

interface Props {
  atlasTextureId: string;
  pxRange: number;
  // x,y,width, height
  clip: [number, number, number, number];
  anchor?: AnchorType;
  size: [number, number];
  color?: string;
  opacity?: number;
}

const tex = texture("tex", {
  sampler: "linearSampler",
});
const pxRange = uniform("float", "pxRange");
const texSize = uniform("vec2", "texSize");
const color = uniform("vec3", "color");
const opacity = uniform("float", "opacity");
const texUv = attribute("vec2", "texUv");

tex.uvNode = texUv;

const vertexNode = cameraProjectionMatrix
  .mul(cameraViewMatrix)
  .mul(modelWorldMatrix)
  .mul(vec4(positionGeometry, 1));

const fragmentNode = (function () {
  const dx = texSize.x.mul(
    //
    length(vec2(dpdxFine(texUv.x), dpdyFine(texUv.x)))
  );

  const dy = texSize.y.mul(
    //
    length(vec2(dpdxFine(texUv.y), dpdyFine(texUv.y)))
  );

  /**
   * Here, `screenPxRange` represents the distance field range in output screen pixels. For example, if the pixel range was set to 2
when generating a 32x32 distance field, and it is used to draw a quad that is 72x72 pixels on the screen,
it should return 4.5 (because 72/32 * 2 = 4.5).
**For 2D rendering, this can generally be replaced by a precomputed uniform value.**

For rendering in a **3D perspective only**, where the texture scale varies across the screen,
you may want to implement this function with fragment derivatives in the following way.
I would suggest precomputing `unitRange` as a uniform variable instead of `pxRange` for better performance.

```glsl
uniform float pxRange; // set to distance field's pixel range

float screenPxRange() {
    vec2 unitRange = vec2(pxRange)/vec2(textureSize(msdf, 0));
    vec2 screenTexSize = vec2(1.0)/fwidth(texCoord);
    return max(0.5*dot(unitRange, screenTexSize), 1.0);
}
```

`screenPxRange()` must never be lower than 1. If it is lower than 2, there is a high probability that the anti-aliasing will fail
and you may want to re-generate your distance field with a wider range.
   */
  const screenPxRange = pxRange.mul(inverseSqrt(add(dx.mul(dx), dy.mul(dy))));

  const sigDist = sub(
    max(min(tex.r, tex.g), min(max(tex.r, tex.g), tex.b)),
    0.5
  );

  const pxDist = sigDist.mul(screenPxRange);

  const edgeWidth = float(0.4);

  const alpha = smoothstep(edgeWidth.negate(), edgeWidth, pxDist);

  const at = Fn(({ a }: { a: Node<"float"> }) => {
    If(a.lessThan(0.001), () => {
      Discard();
    });
    return a;
  });

  const alpha1 = at({ a: alpha });

  return vec4(color, alpha1.mul(opacity));
})();

export default function SpriteMSDF({
  clip,
  atlasTextureId,
  pxRange: pxRangeValue,
  anchor = "center",
  size,
  opacity: opacityValue = 1,
  color,
}: Props) {
  const texUv = useVertexBinding("vec2", quad.vertexCount);

  const texture = useMemo(() => {
    return TextureManager.get(atlasTextureId)!;
  }, [atlasTextureId]);

  const bindings = useBindings(
    {
      tex: "texture_2d",
      opacity: "float",
      color: "vec3",
      texSize: "vec2",
      pxRange: "float",
      linearSampler: "sampler",
    },
    (init) => {
      init.tex(atlasTextureId);
      init.linearSampler({
        minFilter: "linear",
        magFilter: "linear",
      });
    }
  );

  useEffect(() => {
    bindings.updates.pxRange([pxRangeValue]);
  }, [pxRangeValue]);

  useEffect(() => {
    const { opacity, array } = parseColor(color || "#fff");
    bindings.updates.opacity([opacityValue * opacity]);
    bindings.updates.color(array);
  }, [color, opacityValue]);

  useEffect(() => {
    const { width, height } = texture;
    const cWidth = clip[2] / width;
    const cHeight = clip[3] / height;
    const cLeftTop = [clip[0] / width, clip[1] / height];
    const uvs = [
      cLeftTop[0],
      cLeftTop[1],
      // --
      cLeftTop[0] + cWidth,
      cLeftTop[1],
      // --
      cLeftTop[0],
      cLeftTop[1] + cHeight,
      // --
      cLeftTop[0] + cWidth,
      cLeftTop[1] + cHeight,
    ];
    texUv.update(uvs);
    bindings.updates.texSize([width, height]);
  }, [clip.join(","), texture]);

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
        bindings={bindings.resources}
        vertexCount={quad.vertexCount}
        vertex={{ ...quad.vertex, texUv: texUv.buffer }}
        index={quad.index}
        zIndexEnabled
        cullMode="none"
        depthWriteEnabled
      />
    </Relative>
  );
}
