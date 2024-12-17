import { GLTFModel } from "../tools/gltf";
import { GLTFLoader } from "../tools/gltf";

const models: Record<string, GLTFModel> = {};

export async function loadModel(url: string) {
  const baseUrl = url.replace(/[^/]+$/, "");
  const filename = url.replace(baseUrl, "").replace(/^\//, "");
  const loader = new GLTFLoader().setPath(baseUrl);
  return new Promise<GLTFModel>((resolve, reject) => {
    loader.load(filename, (gltf) => {
      models[url] = gltf;
      resolve(gltf);
    });
  });
}

export function getModel(id: string) {
  return models[id];
}
