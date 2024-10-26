import WGSLNodeBuilder from "three/src/renderers/webgpu/nodes/WGSLNodeBuilder.js";
import NodeMaterial from "three/src/materials/nodes/NodeMaterial.js";
import WebGPUPipelineUtils from "three/src/renderers/webgpu/utils/WebGPUPipelineUtils.js";
import { BufferGeometry } from "three/src/core/BufferGeometry.js";

import {
  BindGroupInfo,
  BindInfo,
  MaterialJSON,
  TransferBinding,
} from "./types";

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

  const transferBindings: TransferBinding[] = [];

  const bindMap = new Map<string, { update: () => void }>();

  builder.getBindings().forEach((binding: any) => {
    const { index, name, bindings: _bindings } = binding;

    const bindings: BindInfo[] = [];

    let bindingIndex = 0;

    let uniformIds: string[] = [];
    let buffers: SharedArrayBuffer[] = [];

    for (const b of _bindings) {
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

      bindMap.set(uniformId, b);

      uniformIds.push(uniformId);
      buffers.push(b.buffer.buffer);

      bindingIndex++;
    }

    transferBindings.push({
      groupIndex: index,
      buffers,
    });

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

  return {
    material: mat,
    transferBindings,
    bindMap,
  };
}
