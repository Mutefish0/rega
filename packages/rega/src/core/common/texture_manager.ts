import { Texture, NearestFilter, ClampToEdgeWrapping } from "three/webgpu";
import Image from "../io/image";

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
        const texture = new Texture(image);
        texture.magFilter = NearestFilter;
        texture.minFilter = NearestFilter;
        texture.wrapS = ClampToEdgeWrapping;
        texture.wrapT = ClampToEdgeWrapping;
        texture.needsUpdate = true;
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
