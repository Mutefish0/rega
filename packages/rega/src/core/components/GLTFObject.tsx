import { useMemo } from "react";
import { getModel } from "../common/model_manager";
import { GLTFMesh, GLTFNode } from "../tools/gltf";
import RenderObject from "../primitives/RenderObject";
import Relative from "../primitives/Relative";
import { vec3, float, uniform, texture } from "pure3";
import useBindings from "../hooks/useBingdings";

interface Props {
  modelId: string;
}

const baseColorTextureNode = texture("baseColorTexture");
const normalTextureNode = texture("normalTexture");
const baseColorFactorNode = uniform("vec4", "baseColorFactor");

function Mesh({ mesh }: { mesh: GLTFMesh }) {
  const {
    material: { pbrMetallicRoughness, alphaMode, alphaTest, normalTexture },
  } = mesh;

  const bindings = useBindings(
    {
      baseColorTexture: "texture_2d",
      normalTexture: "texture_2d",
      baseColorFactor: "vec4",
    },
    (init) => {
      init.baseColorTexture(
        pbrMetallicRoughness?.baseColorTexture?.textureId || ""
      );
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

  const normalNode = normalTexture ? normalTextureNode.rgb : undefined;

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
