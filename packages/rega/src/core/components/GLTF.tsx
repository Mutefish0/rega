import { useMemo } from "react";
import { getModel } from "../common/model_manager";
import { GLTFMesh, GLTFNode } from "../tools/gltf";
import RenderObject from "../primitives/RenderObject";
import Relative from "../primitives/Relative";
import { vec3 } from "pure3";

interface Props {
  modelId: string;
}

function Mesh({ mesh }: { mesh: GLTFMesh }) {
  return (
    <RenderObject
      //bindings={bindings.resources}
      colorNode={vec3(1, 0, 0)}
      //material={{}}
      vertexCount={mesh.geometry.vertexCount}
      vertex={mesh.geometry.attributes}
      index={{
        indexBuffer: mesh.geometry.index,
        indexCount: mesh.geometry.indexCount,
      }}
      depthWriteEnabled
      cullMode="back"
      topology={mesh.topology}
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

export default function GLTF({ modelId }: Props) {
  const nodes = useMemo(() => {
    return getModel(modelId).scene.nodes;
  }, [modelId]);

  return nodes.map((node, index) => <Node key={index} node={node} />);
}
