export interface TransferObject {
  id: string;
  material: MaterialJSON;
  bindings: TransferBinding[];
  input: TransferInput;
}

export interface TransferInput {
  vertexBuffers: SharedArrayBuffer[];
  vertexCount: number;
  index?: {
    indexBuffer: SharedArrayBuffer;
    indexCount: number;
  };
}

export interface TransferBinding {
  groupIndex: number;
  buffers: SharedArrayBuffer[];
}

export interface BindingHandle {
  transferBindings: TransferBinding[];
  update: (name: string, value: number[]) => void;
}

export interface VertexHandle {
  buffers: SharedArrayBuffer[];
  update: (name: string, value: number[]) => void;
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
  isSampler: boolean;
  visibility: number;
  access: any;

  uniforms: Array<{
    offset: number;
    name: string;
  }>;
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
