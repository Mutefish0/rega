import React, { useEffect } from "react";
import {
  uniform,
  float,
  positionGeometry,
  round,
  vec2,
  vec4,
  tslFn,
  smoothstep,
  dot,
  length,
  exp,
  If,
  normalize,
  modelViewMatrix,
  cameraViewMatrix,
  modelWorldMatrix,
  cameraProjectionMatrix,
  max,
  abs,
  viewportCoordinate,
  Discard,
  cond,
} from "pure3";
import RenderObject from "../primitives/RenderObject";
import useBindings from "../hooks/useBingdings";
import { parseColor } from "../tools/color";

import quad from "../render/geometry/quad";

const frag_line_dist_alpha = tslFn(
  ([
    pointA_immutable,
    pointB_immutable,
    halfLineWidth_immutable,
    fragCoord_immutable,
  ]: any) => {
    const halfLineWidth = float(halfLineWidth_immutable);
    const pointB = vec2(pointB_immutable);
    const pointA = vec2(pointA_immutable);
    const ab = vec2(normalize(pointB.sub(pointA)));
    const ap = vec2(fragCoord_immutable.sub(pointA));
    const dist = float(length(ap.sub(dot(ap, ab).mul(ab))));
    const alpha = float(
      smoothstep(halfLineWidth.add(0.5), halfLineWidth.sub(0.25), dist)
    );

    return alpha;
  }
).setLayout({
  name: "frag_line_dist_alpha",
  type: "float",
  inputs: [
    { name: "pointA", type: "vec2" },
    { name: "pointB", type: "vec2" },
    { name: "halfLineWidth", type: "float" },
    { name: "fragCoord", type: "vec2" },
  ],
});

const decay = tslFn(([x_immutable, decayRate_immutable]: any) => {
  const decayRate = float(decayRate_immutable);
  const x = float(x_immutable);
  return cond(x.lessThanEqual(0.0), float(1.0), exp(decayRate.negate().mul(x)));
}).setLayout({
  name: "decay",
  type: "float",
  inputs: [
    { name: "x", type: "float" },
    { name: "decayRate", type: "float" },
  ],
});

const cnode = tslFn(
  ([x, y, alpha1, alpha2, pColor, pOpacity, color, opacity]: any) => {
    const cNode = vec4(1, 1, 1, 1).toVar();
    const maxAlpha = max(alpha1, alpha2);

    If(x.equal(0.0).and(alpha2.greaterThan(0.01)), () => {
      cNode.assign(vec4(pColor, maxAlpha.mul(pOpacity)));
    })
      .elseif(y.equal(0.0).and(alpha1.greaterThan(0.01)), () => {
        cNode.assign(vec4(pColor, maxAlpha.mul(pOpacity)));
      })
      .elseif(alpha1.greaterThan(0.01).or(alpha2.greaterThan(0.01)), () => {
        cNode.assign(vec4(color, maxAlpha.mul(opacity)));
      })
      .else(() => {
        Discard(true);
      });

    return cNode;
  }
).setLayout({
  name: "cnode",
  type: "vec4",
  inputs: [
    { name: "x", type: "float" },
    { name: "y", type: "float" },
    { name: "alpha1", type: "float" },
    { name: "alpha2", type: "float" },
    { name: "pColor", type: "vec3" },
    { name: "pOpacity", type: "float" },
    { name: "color", type: "vec3" },
    { name: "opacity", type: "float" },
  ],
});

const fadeDistance = uniform("uint", "fadeDistance");
const resolution = uniform("vec2", "resolution");
const fadeRate = uniform("float", "fadeRate");
const lineWidth = uniform("float", "lineWidth");
const color = uniform("vec3", "color");
const opacity = uniform("float", "opacity");
const pColor = uniform("vec3", "pColor");
const pOpacity = uniform("float", "pOpacity");
const positionNode = vec4(positionGeometry, float(fadeDistance).mul(10.0));

const vertexNode = cameraProjectionMatrix
  .mul(cameraViewMatrix)
  .mul(modelWorldMatrix)
  .mul(positionNode);

const fragmentNode = (function () {
  const x = float(round(positionNode.x));
  const y = float(round(positionNode.y));
  const z = float(round(positionNode.z));
  const p = vec4(
    cameraProjectionMatrix.mul(modelViewMatrix).mul(vec4(x, y, z, 1.0))
  );
  const pp = vec2(p.xy.div(p.w));
  const px = vec2(
    pp.x.div(2).add(0.5).mul(resolution.x),
    pp.y.div(2).add(0.5).oneMinus().mul(resolution.y)
  );
  const p1 = vec4(
    cameraProjectionMatrix.mul(modelViewMatrix).mul(vec4(x.add(1.0), y, z, 1.0))
  );
  const pp1 = vec2(p1.xy.div(p1.w));
  const px1 = vec2(
    pp1.x.div(2).add(0.5).mul(resolution.x),
    pp1.y.div(2).add(0.5).oneMinus().mul(resolution.y)
  );
  const p2 = vec4(
    cameraProjectionMatrix.mul(modelViewMatrix).mul(vec4(x, y.add(1.0), z, 1.0))
  );
  const pp2 = vec2(p2.xy.div(p2.w));
  const px2 = vec2(
    pp2.x.div(2).add(0.5).mul(resolution.x),
    pp2.y.div(2).add(0.5).oneMinus().mul(resolution.y)
  );
  const dist = float(max(abs(x), abs(y)));
  const alphaFade = decay(dist.sub(fadeDistance), fadeRate);
  const alpha1 = frag_line_dist_alpha(
    px,
    px1,
    lineWidth.div(2.0),
    viewportCoordinate.xy
  ).mul(alphaFade);
  const alpha2 = frag_line_dist_alpha(
    px,
    px2,
    lineWidth.div(2.0),
    viewportCoordinate.xy
  ).mul(alphaFade);

  return cnode(x, y, alpha1, alpha2, pColor, pOpacity, color, opacity);
})();

interface GridProps {
  lineWidth?: number;
  fadeDistance?: number;
  fadeRate?: number;
  color?: string;
  principleColor?: string;
}

export default function Grid({
  lineWidth = 1,
  fadeDistance = 50,
  fadeRate = 0.15,
  color = "rgba(255,0,0,0.1)",
  principleColor = color,
}: GridProps) {
  const bindings = useBindings({
    resolution: "vec2",
    lineWidth: "float",
    fadeDistance: "uint",
    fadeRate: "float",
    opacity: "float",
    color: "vec3",
    pOpacity: "float",
    pColor: "vec3",
  });

  useEffect(() => {
    bindings.updates.lineWidth([lineWidth]);
  }, [lineWidth]);

  useEffect(() => {
    bindings.updates.fadeDistance([fadeDistance]);
  }, [fadeDistance]);

  useEffect(() => {
    bindings.updates.fadeRate([fadeRate]);
  }, [fadeRate]);

  useEffect(() => {
    const { opacity, array } = parseColor(color);
    bindings.updates.opacity([opacity]);
    bindings.updates.color(array);
  }, [color]);

  useEffect(() => {
    const { opacity, array } = parseColor(principleColor);
    bindings.updates.pOpacity([opacity]);
    bindings.updates.pColor(array);
  }, [principleColor]);

  return (
    <RenderObject
      bindings={bindings.resources}
      vertexNode={vertexNode}
      fragmentNode={fragmentNode}
      vertexCount={quad.vertexCount}
      vertex={quad.vertex}
      index={quad.index}
    />
  );
}
