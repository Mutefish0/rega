import { getBytesPerTexel } from "../render/texture";
import Image from "../io/image";
import DBStore from "./db";

export interface Texture {
  type: "sampledTexture";
  buffer: SharedArrayBuffer;
  width: number;
  height: number;
  format: GPUTextureFormat;
  immutable: boolean;
}

const store = new DBStore("textures");

export default class TextureManager {
  static textures = new Map<string, Texture>();

  public static get(id: string) {
    return TextureManager.textures.get(id);
  }

  private static fromCacheData(
    width: number,
    height: number,
    data: ArrayBuffer
  ) {
    const format = "rgba8unorm" as const;

    const bytesPerTexel = getBytesPerTexel(format);

    // // 256 byte alignment
    const destBytesPerRow = Math.ceil((width * bytesPerTexel) / 256) * 256;

    const sab = new SharedArrayBuffer(destBytesPerRow * height);

    new Uint8Array(sab).set(new Uint8Array(data));

    const texture = {
      height: height,
      width: width,
      buffer: sab,
      type: "sampledTexture" as const,
      format,
      immutable: true,
    };

    return texture;
  }

  public static async add(url: string) {
    if (TextureManager.textures.has(url)) {
      return;
    }

    const cache = await store.get(url);

    if (cache) {
      const texture = TextureManager.fromCacheData(
        cache.width,
        cache.height,
        cache.data
      );

      TextureManager.textures.set(url, texture);

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
        const storeBuffer = new Uint8Array(sab.byteLength);
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

          storeBuffer.set(sourceView, destOffset);
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

        store
          .add({
            id: url,
            width: image.width,
            height: image.height,
            data: storeBuffer,
          })
          .then(() => {
            resolve(texture);
          });
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
