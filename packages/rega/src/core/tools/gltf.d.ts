export interface IGLTFLoader {
  new (): IGLTFLoader;
  setPath(path: string): this;
  load(url: string, onLoad: (gltf: any) => void): void;
}
