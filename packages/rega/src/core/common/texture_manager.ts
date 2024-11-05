import {
  NearestFilter,
  ClampToEdgeWrapping,
  Texture as Texture3,
} from "three/webgpu";
import Image from "../io/image";

interface Texture {
  type: "sampledTexture";
  buffer: SharedArrayBuffer;
  width: number;
  height: number;
}

export default class TextureManager {
  static textures = new Map<string, Texture>();

  public static get(id: string) {
    return TextureManager.textures.get(id);
  }

  public static async add(url: string) {
    if (TextureManager.textures.has(url)) {
      return;
    }
    await new Promise<Texture>((resolve, reject) => {
      const image = new Image();
      image.onload = () => {
        //const texture3 = new Texture3(image);
        // texture.magFilter = NearestFilter;
        // texture.minFilter = NearestFilter;
        // texture.wrapS = ClampToEdgeWrapping;
        // texture.wrapT = ClampToEdgeWrapping;
        //texture.needsUpdate = true;
        const sab = new SharedArrayBuffer(image.data.byteLength);
        new Uint8Array(sab).set(image.data);

        const texture = {
          height: image.height,
          width: image.width,
          buffer: sab,
          type: "sampledTexture" as const,
        };

        TextureManager.textures.set(url, texture);

        resolve(texture);
      };

      image.onerror = (err) => {
        reject(err);
      };

      image.src = url;
    });
  }

  public static setTexture(id: string, texture: Texture) {
    TextureManager.textures.set(id, texture);
  }
}
