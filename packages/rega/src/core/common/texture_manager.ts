import { getBytesPerTexel } from "../render/texture";

import Image from "../io/image";

export interface Texture {
  type: "sampledTexture";
  buffer: SharedArrayBuffer;
  width: number;
  height: number;
  format: GPUTextureFormat;
  immutable: boolean;
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
        const format = "rgba8unorm" as const;
        const bytesPerTexel = getBytesPerTexel(format);

        // 256 byte alignment
        const destBytesPerRow =
          Math.ceil((image.width * bytesPerTexel) / 256) * 256;

        const sab = new SharedArrayBuffer(destBytesPerRow * image.height);
        const destView = new Uint8Array(sab);

        const sourceBytesPerRow = image.width * bytesPerTexel;

        for (let row = 0; row < image.height; row++) {
          const destOffset = row * destBytesPerRow;
          const sourceOffset = row * sourceBytesPerRow;

          const sourceView = new Uint8Array(
            image.data.buffer,
            sourceOffset,
            sourceBytesPerRow
          );

          destView.set(sourceView, destOffset);
        }

        const texture = {
          height: image.height,
          width: image.width,
          buffer: sab,
          type: "sampledTexture" as const,
          format,
          immutable: true,
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
