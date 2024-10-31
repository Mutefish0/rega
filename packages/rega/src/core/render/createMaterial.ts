import WGSLNodeBuilder from "three/src/renderers/webgpu/nodes/WGSLNodeBuilder.js";
import NodeMaterial from "three/src/materials/nodes/NodeMaterial.js";
import WebGPUPipelineUtils from "three/src/renderers/webgpu/utils/WebGPUPipelineUtils.js";
import { BufferGeometry } from "three/src/core/BufferGeometry.js";
import sortBy from "lodash/sortBy";
import { BindGroupInfo, BindInfo, MaterialJSON } from "./types";

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

export default function createMaterial(
  vertexNode: Node,
  fragmentNode: Node,
  options: Options = {
    frontFace: "ccw",
    cullMode: "none",
  }
) {
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
      hasFeature,
    }
  );

  builder.build();

  const bindingGroups: BindGroupInfo[] = [];

  builder.getBindings().forEach((bg: any) => {
    const { index, name } = bg;

    const bindings: BindInfo[] = [];

    for (const b of bg.bindings) {
      if (b.isUniformBuffer) {
        const { byteLength, offsets } = calcBindingBufferLayout(b.uniforms);
        const us = b.uniforms.map((u: any, i: number) => ({
          name: u.name,
          offset: offsets[i],
        }));
        bindings.push({
          type: "uniformBuffer",
          visibility: b.visibility,
          byteLength,
          uniforms: us,
        });
      } else if (b.isSampler) {
        bindings.push({
          type: "sampler",
          visibility: b.visibility,
        });
      } else if (b.isSampledTexture) {
        bindings.push({
          type: "sampledTexture",
          visibility: b.visibility,
          name: b.name,
        });
      }
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
    bindings: sortBy(bindingGroups, "index"),
    blend,
    format: "bgra8unorm",
    frontFace: options.frontFace || "ccw",
    cullMode: options.cullMode || "none",
  };

  return mat;
}
