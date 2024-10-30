import {
  NearestFilter,
  ClampToEdgeWrapping,
  Texture as Texture3,
} from "three/webgpu";
import Image from "../io/image";
import createSharedBuffer, {
  createUint8Array,
} from "../render/createSharedBuffer";

interface Texture {
  texture3: Texture3;
  sab: SharedArrayBuffer;
  data: Uint8Array;
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
        const texture3 = new Texture3(image);
        // texture.magFilter = NearestFilter;
        // texture.minFilter = NearestFilter;
        // texture.wrapS = ClampToEdgeWrapping;
        // texture.wrapT = ClampToEdgeWrapping;
        //texture.needsUpdate = true;

        const sab = createSharedBuffer(image.data.byteLength);
        const dataView = createUint8Array(sab);

        dataView.set(image.data);

        const texture = {
          texture3,
          height: image.height,
          width: image.width,
          data: dataView,
          sab,
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
