import { useMemo } from "react";
import { getModel } from "../common/model_manager";
import { GLTFMesh, GLTFNode } from "../tools/gltf";
import RenderObject from "../primitives/RenderObject";
import Relative from "../primitives/Relative";
import {
  vec3,
  float,
  uniform,
  texture,
  uv,
  sub,
  max,
  Fn,
  Node as NNode,
  dpdxFine,
  dpdyFine,
  dFdx,
  dFdy,
  cross,
  dot,
  add,
  inverseSqrt,
  normalize,
  normalGeometry,
  positionGeometry,
  modelViewMatrix,
  vec4,
  mat3,
  legacyUv,
} from "pure3";
import useBindings from "../hooks/useBingdings";

// Normal Mapping Without Precomputed Tangents
// http://www.thetenthplanet.de/archives/1180

const perturbNormal2Arb = /*@__PURE__*/ Fn(
  (inputs: {
    eye_pos: NNode<"vec3">;
    surf_norm: NNode<"vec3">;
    uv: NNode<"vec2">;
  }) => {
    const { eye_pos, surf_norm, uv } = inputs;

    const q0 = dpdxFine(eye_pos);
    const q1 = dpdyFine(eye_pos);
    const st0 = dpdxFine(uv);
    const st1 = dpdyFine(uv);

    const N = surf_norm; // normalized

    const q1perp = cross(q1, N);
    const q0perp = cross(N, q0);

    const T = q1perp.mul(st0.x).add(q0perp.mul(st1.x));
    const B = q1perp.mul(st0.y).add(q0perp.mul(st1.y));

    const scale = inverseSqrt(max(dot(T, T), dot(B, B)));

    return mat3(T.mul(scale), B.mul(scale), N);
  }
);

interface Props {
  modelId: string;
}

const baseColorTextureNode = texture("baseColorTexture", {
  sampler: "baseColorTextureSampler",
});

const normalTextureNode = texture("normalTexture", {
  sampler: "normalTextureSampler",
});

const perrutbNormalNode = normalize(
  perturbNormal2Arb({
    uv,
    eye_pos: modelViewMatrix.mul(vec4(positionGeometry, 1.0)).xyz,
    surf_norm: normalGeometry,
  }).mul(sub(normalTextureNode.rgb, 0.5).mul(2))
);

const baseColorFactorNode = uniform("vec4", "baseColorFactor");

function Mesh({ mesh }: { mesh: GLTFMesh }) {
  const {
    material: { pbrMetallicRoughness, alphaMode, alphaTest, normalTexture },
  } = mesh;

  const bindings = useBindings(
    {
      baseColorTextureSampler: "sampler",
      baseColorTexture: "texture_2d",
      normalTextureSampler: "sampler",
      normalTexture: "texture_2d",
      baseColorFactor: "vec4",
    },
    (init) => {
      init.baseColorTexture(
        pbrMetallicRoughness?.baseColorTexture?.textureId || ""
      );

      init.baseColorTextureSampler(
        pbrMetallicRoughness?.baseColorTexture?.sampler || {}
      );

      init.normalTextureSampler(normalTexture?.sampler || {});

      init.normalTexture(normalTexture?.textureId || "");

      if (pbrMetallicRoughness?.baseColorFactor) {
        init.baseColorFactor(pbrMetallicRoughness?.baseColorFactor);
      }
    }
  );

  const color4Node = pbrMetallicRoughness?.baseColorTexture
    ? baseColorTextureNode
    : baseColorFactorNode;

  const colorNode = color4Node.rgb;
  const opacityNode = alphaMode === "OPAQUE" ? float(1) : color4Node.a;

  const normalNode = normalTexture ? perrutbNormalNode : undefined;

  return (
    <RenderObject
      bindings={bindings.resources}
      colorNode={colorNode}
      opacityNode={opacityNode}
      normalNode={normalNode}
      vertexCount={mesh.geometry.vertexCount}
      vertex={mesh.geometry.attributes}
      index={{
        indexBuffer: mesh.geometry.index,
        indexCount: mesh.geometry.indexCount,
      }}
      depthWriteEnabled
      cullMode="back"
      topology={mesh.topology}
      alphaTest={
        alphaMode === "MASK" && typeof alphaTest !== "undefined"
          ? float(alphaTest)
          : undefined
      }
    />
  );
}

function Node({ node }: { node: GLTFNode }) {
  if (node.mesh) {
    return (
      <Relative
        translation={
          node.translation
            ? {
                x: node.translation[0],
                y: node.translation[1],
                z: node.translation[2],
              }
            : {}
        }
        rotation={
          node.rotation
            ? {
                x: node.rotation[0],
                y: node.rotation[1],
                z: node.rotation[2],
              }
            : {}
        }
      >
        <Mesh mesh={node.mesh} />
      </Relative>
    );
  } else {
    return (
      <Relative
        translation={
          node.translation
            ? {
                x: node.translation[0],
                y: node.translation[1],
                z: node.translation[2],
              }
            : {}
        }
        rotation={
          node.rotation
            ? {
                x: node.rotation[0],
                y: node.rotation[1],
                z: node.rotation[2],
              }
            : {}
        }
      >
        {node.children.map((child, index) => (
          <Node key={index} node={child} />
        ))}
      </Relative>
    );
  }
}

export default function GLTFObject({ modelId }: Props) {
  const nodes = useMemo(() => {
    return getModel(modelId).scene.nodes;
  }, [modelId]);

  return nodes.map((node, index) => <Node key={index} node={node} />);
}
