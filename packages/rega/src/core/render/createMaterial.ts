import WGSLNodeBuilder from "three/src/renderers/webgpu/nodes/WGSLNodeBuilder.js";
import NodeMaterial from "three/src/materials/nodes/NodeMaterial.js";
import WebGPUPipelineUtils from "three/src/renderers/webgpu/utils/WebGPUPipelineUtils.js";
import { BufferGeometry } from "three/src/core/BufferGeometry.js";

import { BindGroupInfo, BindInfo, MaterialJSON } from "./types";

const webGPUPipelineUtil = new WebGPUPipelineUtils();

// 不重要
const geometry = new BufferGeometry();

export default function createMaterial(vertexNode: Node, fragmentNode: Node) {
  const material = new NodeMaterial();

  material.vertexNode = vertexNode;
  material.fragmentNode = fragmentNode;

  const blend = webGPUPipelineUtil._getBlending(material) as GPUBlendState;

  const builder = new WGSLNodeBuilder(
    { geometry, material },
    {
      getRenderTarget: () => null,
      nodes: {
        library: {
          fromMaterial: (m: any) => m,
        },
      },
      getMRT: () => null,
    }
  );

  builder.build();

  const bindingGroups: BindGroupInfo[] = [];

  builder.getBindings().forEach((binding: any) => {
    const { index, name, bindings: _bindings } = binding;

    const bindings: BindInfo[] = [];

    let bindingIndex = 0;

    let uniformIds: string[] = [];

    for (const b of _bindings) {
      debugger;

      const uniformId = b.uniforms[0].nodeUniform.node.uuid;
      bindings.push({
        isBuffer: b.isBuffer,
        isNodeUniformsGroup: b.isNodeUniformsGroup,
        isUniformBuffer: b.isUniformBuffer,
        isUniformsGroup: b.isUniformsGroup,
        isStorageBuffer: b.isStorageBuffer,
        visibility: b.visibility,
        access: b.access,
        bytesPerElement: b.bytesPerElement,
        byteLength: b.byteLength,
        name: b.name,
      });

      uniformIds.push(uniformId);

      bindingIndex++;
    }

    bindingGroups.push({
      index,
      name,
      bindings,
    });
  });

  const mat: MaterialJSON = {
    vertexShader: builder.vertexShader,
    fragmentShader: builder.fragmentShader,
    attributes: builder.attributes,
    bindings: bindingGroups,
    blend,
    format: "bgra8unorm",
  };

  return mat;
}
