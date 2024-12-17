export interface GLTFMesh {
  topology: GPUPrimitiveTopology;
  geometry: {
    vertexCount: number;
    indexCount: number;
    index: SharedArrayBuffer;
    attributes: Record<string, SharedArrayBuffer>;
  };
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
