export interface TransferBinding {
  id: string;
  groupIndex: number;
  bindingIndex: number;
  buffer: SharedArrayBuffer;
}

export interface BindInfo {
  id: string;
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
  id: string;
  vertexShader: string;
  fragmentShader: string;
  attributes: Array<{
    name: string;
    type: "vec3" | "vec2" | "float";
  }>;
  bindings: Array<BindGroupInfo>;
  blend: GPUBlendState;
}
