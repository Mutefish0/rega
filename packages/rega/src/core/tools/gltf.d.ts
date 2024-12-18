export interface GLTFMaterial {
  extensions: {};
  pbrMetallicRoughness: {
    metallicFactor?: number;
    roughnessFactor?: number;
    baseColorFactor?: number[];
    baseColorTexture?: {
      textureId: string;
      sampler: {};
    };
    metallicRoughnessTexture?: {
      textureId: string;
      sampler: {};
    };
  };
  normalTexture?: {
    textureId: string;
    sampler: {};
  };
  alphaMode: "OPAQUE" | "MASK" | "BLEND";
  alphaTest?: number;
}

export interface GLTFMesh {
  topology: GPUPrimitiveTopology;
  geometry: {
    vertexCount: number;
    indexCount: number;
    index: SharedArrayBuffer;
    attributes: Record<string, SharedArrayBuffer>;
  };
  material: GLTFMaterial;
}

export interface GLTFNode {
  mesh?: GLTFMesh;
  children: GLTFNode[];
  translation?: [number, number, number];
  rotation?: [number, number, number, number];
  scale?: [number, number, number];
  matrix?: number[];
}

interface GLTFScene {
  nodes: GLTFNode[];
}

export interface GLTFModel {
  scene: GLTFScene;
}

export interface IGLTFLoader {
  new (): IGLTFLoader;
  setPath(path: string): this;
  load(url: string, onLoad: (gltf: GLTFModel) => void): void;
}

export const GLTFLoader: IGLTFLoader;
