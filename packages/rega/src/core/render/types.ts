export interface TransferObject {
  id: string;
  material: MaterialJSON;
  bindings: TransferBinding[];
  input: TransferInput;
}

export interface TransferInput {
  key: string;
  vertexBuffers: SharedArrayBuffer[];
  vertexCount: number;
  index?: {
    key: string;
    indexBuffer: SharedArrayBuffer;
    indexCount: number;
    indexFormat: GPUIndexFormat;
  };
}

export interface TransferBinding {
  groupIndex: number;
  buffers: SharedArrayBuffer[];
}

export interface BindInfo {
  byteLength: number;
  bytesPerElement: number;
  name: string;
  isBuffer: boolean;
  isNodeUniformsGroup: boolean;
  isUniformBuffer: boolean;
  isUniformsGroup: boolean;
  isStorageBuffer: boolean;
  visibility: number;
  access: any;
}

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
    type: "vec3" | "vec2" | "float";
  }>;
  bindings: Array<BindGroupInfo>;
  blend: GPUBlendState;
  format: GPUTextureFormat;
}