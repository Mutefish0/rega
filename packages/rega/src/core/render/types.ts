import { WGSLValueType } from "pure3";

export interface TransferBinding {
  name: string;
  binding: number;
  visibility: number;
  resource: TransferResource;
}

export interface NamedBindingLayout {
  type: ResourceType;
  name: string;
  binding: number;
  visibility: number;
}

export interface BindingLayout {
  type: ResourceType;
  binding: number;
}

export interface TransferObject {
  id: string;

  groupId: string;

  passes: Record<
    string,
    {
      material: MaterialJSON;
      bindings: TransferBinding[];
    }
  >;

  input: TransferInput;
  textures: Record<
    string,
    {
      width: number;
      height: number;
      buffer: SharedArrayBuffer;
      format: GPUTextureFormat;
      immutable: boolean;
    }
  >;
}

// export interface TransferRenderTarget {
//   id: string;
//   viewport: SharedArrayBuffer;
//   bindings: TransferBinding[];
//   textures: Record<
//     string,
//     {
//       width: number;
//       height: number;
//       buffer: SharedArrayBuffer;
//       format: GPUTextureFormat;
//       immutable: boolean;
//     }
//   >;
// }

export interface TransferRenderPass {
  id: string;
  depth: TransferRenderPassTexture | TransferRenderPassRef;
  output: Array<
    | TransferRenderPassTexture
    | TransferRenderPassRef
    | { ref: "swapchain"; loadOp: GPULoadOp; storeOp: GPUStoreOp }
  >;
  groups: string[];
}

export interface TransferRenderPassRef {
  ref: string;
  src: "depth" | "output_0" | "output_1" | "output_2";
  loadOp: GPULoadOp;
  storeOp: GPUStoreOp;
}
export interface TransferRenderPassTexture {
  loadOp: GPULoadOp;
  storeOp: GPUStoreOp;
  width: number;
  height: number;
  format: GPUTextureFormat;
}

export interface TransferPipeline {
  sortedPasses: string[];
  passes: Record<string, TransferRenderPass>;
  bindings: TransferBinding[];
  textures: Record<
    string,
    {
      width: number;
      height: number;
      buffer: SharedArrayBuffer;
      format: GPUTextureFormat;
      immutable: boolean;
    }
  >;
}

export interface TransferInput {
  vertexBuffers: Array<{
    name: string;
    buffer: SharedArrayBuffer;
    binding: number;
  }>;
  vertexCtrlBuffer: SharedArrayBuffer;

  index?: {
    indexBuffer: SharedArrayBuffer;
    indexCount: number;
  };
}

export type ResourceType =
  | "uniformBuffer"
  | "sampler"
  | "sampledTexture"
  | "uintTexture"
  | "sintTexture";

export type UniformType =
  | WGSLValueType
  | "texture_2d"
  | "texture_2d<uint>"
  | "texture_2d<sint>"
  | "sampler";

export type TransferTextureResource = {
  type: "texture";
  textureId: string;
  sampleType: "float" | "uint" | "sint";
};

export type TransferSamplerResource = {
  type: "sampler";
  magFilter?: GPUFilterMode;
  minFilter?: GPUFilterMode;
  compare?: GPUCompareFunction;
  maxAnisotropy?: number;
};

export type TransferUniformBufferResource = {
  type: "uniformBuffer";
  buffer: SharedArrayBuffer;
};

export type TransferResource =
  | TransferUniformBufferResource
  | TransferSamplerResource
  | TransferTextureResource;

export interface BindingHandle {
  transferBindings: TransferBinding[];
  update: (name: string, value: number[]) => void;
}

export interface VertexHandle {
  buffers: SharedArrayBuffer[];
  update: (name: string, value: number[]) => void;
}

interface UniformBindInfo {
  type: "uniformBuffer";
  byteLength: number;
  visibility: number;
  uniforms: Array<{
    offset: number;
    name: string;
  }>;
}

interface SamplerBindInfo {
  type: "sampler";
  visibility: number;
}

interface SampledTextureBindInfo {
  type: "sampledTexture";
  visibility: number;
  name: string;
}

export type BindInfo =
  | UniformBindInfo
  | SamplerBindInfo
  | SampledTextureBindInfo;

export interface BindGroupInfo {
  index: number;
  name: string;
  bindings: Array<BindInfo>;
}

export interface MaterialJSON {
  vertexShader: string;

  fragmentShader: string;

  attributes: Array<{
    name: string;
    binding: number;
    type: "vec3" | "vec2" | "float";
  }>;

  bindGroups: Array<NamedBindingLayout[]>;

  blend: GPUBlendState;
  format: GPUTextureFormat;

  frontFace: GPUFrontFace;
  cullMode: GPUCullMode;

  topology: GPUPrimitiveTopology;
  depthWriteEnabled: boolean;
}

export function resourceToResourceType(
  resource: TransferResource
): ResourceType {
  let type;
  if (resource.type === "texture") {
    if (resource.sampleType === "sint") {
      type = "sintTexture" as const;
    } else if (resource.sampleType === "uint") {
      type = "uintTexture" as const;
    } else {
      type = "sampledTexture" as const;
    }
  } else {
    type = resource.type;
  }
  return type;
}
