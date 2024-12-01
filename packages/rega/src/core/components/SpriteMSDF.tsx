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
  clamp,
  uv,
  vec2,
  dot,
  float,
  smoothstep,
  add,
  sub,
  attribute,
  abs,
  fwidth,
  dFdx,
  dFdy,
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
  const pxRange = float(4.0);

  const dx = texSize.x.mul(
    //
    length(vec2(dpdxFine(texUv.x), dpdyFine(texUv.x)))
  );

  const dy = texSize.y.mul(
    //
    length(vec2(dpdxFine(texUv.y), dpdyFine(texUv.y)))
  );

  const toPixels = pxRange.mul(
    //
    inverseSqrt(add(dx.mul(dx), dy.mul(dy)))
  );

  const sigDist = sub(
    max(min(tex.r, tex.g), min(max(tex.r, tex.g), tex.b)),
    0.5
  );

  const pxDist = sigDist.mul(toPixels);

  const edgeWidth = float(0.5);

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
    const { opacity, array } = parseColor(color || "#fff");
    bindings.updates.opacity([opacityValue * opacity]);
    bindings.updates.color(array);
  }, [color, opacityValue]);

  //   useEffect(() => {
  //     const { opacity: opacity1, array } = parseColor(colorValue || "#fff");
  //     bindings.updates.opacity([opacityValue * opacity1]);
  //     bindings.updates.color(array);
  //   }, [colorValue, opacityValue]);

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
        //         frgamentCode={
        //           /* wgsl */ `
        //           // Three.js r170dev - Node System

        // // global
        // diagnostic( off, derivative_uniformity );

        // // uniforms
        // @binding( 0 ) @group( 0 ) var<uniform> color : vec3<f32>;
        // @binding( 1 ) @group( 0 ) var<uniform> opacity : f32;
        // @binding( 6 ) @group( 0 ) var tex_sampler : sampler;
        // @binding( 2 ) @group( 0 ) var tex : texture_2d<f32>;
        // @binding( 3 ) @group( 0 ) var<uniform> texSize : vec2<f32>;

        // // structs

        // struct OutputStruct {
        // 	@location(0) color: vec4<f32>
        // };
        // var<private> output : OutputStruct;

        // // codes

        // @fragment
        // fn main( @location( 0 ) nodeVarying0 : vec2<f32> ) -> OutputStruct {

        //     // pxRange (AKA distanceRange) comes from the msdfgen tool. Don McCurdy's tool
        //   // uses the default which is 4.
        //   let texSize = vec2<f32>(512.0, 512.0);

        //   let pxRange = 4.0;
        //   let dx = texSize.x * length(vec2f(dpdxFine(nodeVarying0.x), dpdyFine(nodeVarying0.x)));
        //   let dy = texSize.y * length(vec2f(dpdxFine(nodeVarying0.y), dpdyFine(nodeVarying0.y)));

        //   let toPixels = pxRange * inverseSqrt(dx * dx + dy * dy);

        //   let c = textureSample( tex, tex_sampler, nodeVarying0 );

        //   let sigDist = max(min(c.r, c.g), min(max(c.r, c.g), c.b)) - 0.5;

        //   let pxDist = sigDist * toPixels;

        //   let edgeWidth = 0.5;

        //   let alpha = smoothstep(-edgeWidth, edgeWidth, pxDist);

        //   if (alpha < 0.99) {
        //     //discard;
        //     output.color = vec4f(1.0, 0.0, 0.0, 0.2);
        //   }

        //   output.color = vec4f(1.0, 1.0, 0.0, alpha);

        //   return output;

        // }`
        //         }
      />
    </Relative>
  );
}
