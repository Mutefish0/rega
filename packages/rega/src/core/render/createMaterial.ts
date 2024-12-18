import WGSLNodeBuilder from "three/src/renderers/webgpu/nodes/WGSLNodeBuilder.js";
import NodeMaterial from "three/src/materials/nodes/NodeMaterial.js";
import WebGPUPipelineUtils from "three/src/renderers/webgpu/utils/WebGPUPipelineUtils.js";
import { BufferGeometry } from "three/src/core/BufferGeometry.js";
import { MaterialJSON, NamedBindingLayout } from "./types";
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
  topology?: GPUPrimitiveTopology;
  depthWriteEnabled?: boolean;
}

const cahce = new Map<string, MaterialJSON>();

export default function createMaterial(
  vertexNode: Node<"vec4">,
  fragmentNode: Node<"vec4">,
  getBindingLayout: (name: string, isSampler?: boolean) => { group: number; binding: number },
  getAttributeLayout: (name: string) => number,
  options: Options = {
    frontFace: "ccw",
    cullMode: "none",
    topology: "triangle-list",
    depthWriteEnabled: false,
  }
) {
  const frontFace = options.frontFace || "ccw";
  const cullMode = options.cullMode || "back";
  const topology = options.topology || "triangle-list";
  const depthWriteEnabled = options.depthWriteEnabled || false;

  const key = [
    vertexNode.uuid,
    fragmentNode.uuid,
    [frontFace, cullMode, topology, depthWriteEnabled].join("-"),
  ].join("\n--\n");

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
      getAttributeLayout,
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
    const visited: Record<
      string,
      { bindingIndex: number; visibility: number }
    > = {};
    let bindingIndex = 0;

    for (const b of g.bindings) {
      const layout = getBindingLayout(b.name, b.isSampler);

      if (layout.group !== index) {
        throw new Error("Unmatched group: " + b.name);
      }

      const visitedItem = visited[b.name];

      if (visitedItem) {
        if (visitedItem.visibility !== b.visibility) {
          visitedItem.visibility = visitedItem.visibility | b.visibility;
          bindGroups[index][visitedItem.bindingIndex].visibility =
            visitedItem.visibility;
          continue;
        } else {
          throw new Error("Duplicated binding: " + b.name);
        }
      }

      visited[b.name] = {
        bindingIndex,
        visibility: b.visibility,
      };

      bindingIndex++;

      if (b.isSampler) {
        bindGroups[index].push({
          name: b.name,
          type: "sampler",
          binding: layout.binding,
          visibility: b.visibility,
        });
      } else if (b.isSampledTexture) {
        const internalFormat = b.texture.internalFormat;
        bindGroups[index].push({
          name: b.name,
          type: /uint/.test(internalFormat)
            ? "uintTexture"
            : /sint/.test(internalFormat)
            ? "sintTexture"
            : "sampledTexture",
          binding: layout.binding,
          visibility: b.visibility,
        });
      } else if (b.isUniformBuffer) {
        bindGroups[index].push({
          name: b.name,
          type: "uniformBuffer",
          binding: layout.binding,
          visibility: b.visibility,
        });
      } else {
        throw new Error("Unknown binding type");
      }
    }
  }

  const mat: MaterialJSON = {
    vertexShader: builder.vertexShader,
    fragmentShader: builder.fragmentShader,
    attributes: builder.attributes.map((attr) => ({
      ...attr,
      binding: getAttributeLayout(attr.name),
    })),
    bindGroups,
    blend,
    format: "bgra8unorm",
    frontFace: options.frontFace || "ccw",
    cullMode: options.cullMode || "back",
    topology: options.topology || "triangle-list",
    depthWriteEnabled: options.depthWriteEnabled || false,
  };

  cahce.set(key, mat);

  return mat;
}
