import WGSLNodeBuilder from "three/src/renderers/webgpu/nodes/WGSLNodeBuilder.js";
import NodeMaterial from "three/src/materials/nodes/NodeMaterial.js";
import WebGPUPipelineUtils from "three/src/renderers/webgpu/utils/WebGPUPipelineUtils.js";
import { BufferGeometry } from "three/src/core/BufferGeometry.js";
import {
  BindGroupInfo,
  BindInfo,
  MaterialJSON,
  NamedBindingLayout,
} from "./types";
import { Node } from "pure3";

import { hasFeature } from "./features";

const webGPUPipelineUtil = new WebGPUPipelineUtils();

// 不重要
const geometry = new BufferGeometry();

interface UniformLayout {
  boundary: number;
  itemSize: number;
}

const BYTES_PER_ELEMENT = 4;
// size of a chunk in bytes (STD140 layout)
export const GPU_CHUNK_BYTES = 16;

function calcBindingBufferLayout(uniforms: UniformLayout[]) {
  let offset = 0; // global buffer offset in bytes

  let offsets = [];

  for (let i = 0, l = uniforms.length; i < l; i++) {
    const uniform = uniforms[i];

    const { boundary, itemSize } = uniform;

    // offset within a single chunk in bytes

    const chunkOffset = offset % GPU_CHUNK_BYTES;
    const remainingSizeInChunk = GPU_CHUNK_BYTES - chunkOffset;

    // conformance tests

    if (chunkOffset !== 0 && remainingSizeInChunk - boundary < 0) {
      // check for chunk overflow

      offset += GPU_CHUNK_BYTES - chunkOffset;
    } else if (chunkOffset % boundary !== 0) {
      // check for correct alignment

      offset += chunkOffset % boundary;
    }

    offsets.push(offset);

    offset += itemSize * BYTES_PER_ELEMENT;
  }

  const byteLength = Math.ceil(offset / GPU_CHUNK_BYTES) * GPU_CHUNK_BYTES;

  return {
    byteLength,
    offsets,
  };
}

interface Options {
  frontFace?: GPUFrontFace;
  cullMode?: GPUCullMode;
}

const cahce = new Map<string, MaterialJSON>();

export default function createMaterial(
  vertexNode: Node<"vec4">,
  fragmentNode: Node<"vec4">,
  getBindingLayout: (name: string) => { group: number; binding: number },
  options: Options = {
    frontFace: "ccw",
    cullMode: "none",
  }
) {
  const key = [vertexNode.uuid, fragmentNode.uuid].join(",");

  if (cahce.has(key)) {
    return cahce.get(key)!;
  }

  const material = new NodeMaterial();

  material.vertexNode = vertexNode;
  material.fragmentNode = fragmentNode;

  const blend = webGPUPipelineUtil._getBlending(material) as GPUBlendState;

  const builder = new WGSLNodeBuilder(
    { geometry, material },
    {
      getBindingLayout,
      getRenderTarget: () => null,
      nodes: {
        library: {
          fromMaterial: (m: any) => m,
        },
      },
      getMRT: () => null,
      hasFeature,
    }
  );

  builder.build();

  const bindings = builder.getBindings();

  const bindGroups: NamedBindingLayout[][] = [[], [], [], []];

  for (const g of bindings) {
    const index = +g.name;
    for (const b of g.bindings) {
      const layout = getBindingLayout(b.name);
      if (layout.group !== index) {
        throw new Error("Unmatched group: " + b.name);
      }
      if (b.isSampler) {
        bindGroups[index].push({
          name: b.name,
          type: "sampler",
          binding: layout.binding,
        });
      } else if (b.isSampledTexture) {
        bindGroups[index].push({
          name: b.name,
          type: "sampledTexture",
          binding: layout.binding,
        });
      } else if (b.isUniformBuffer) {
        bindGroups[index].push({
          name: b.name,
          type: "uniformBuffer",
          binding: layout.binding,
        });
      } else {
        throw new Error("Unknown binding type");
      }
    }
  }

  const mat: MaterialJSON = {
    vertexShader: builder.vertexShader,
    fragmentShader: builder.fragmentShader,
    attributes: builder.attributes,
    bindGroups,
    blend,
    format: "bgra8unorm",
    frontFace: options.frontFace || "ccw",
    cullMode: options.cullMode || "back",
  };

  cahce.set(key, mat);

  return mat;
}
