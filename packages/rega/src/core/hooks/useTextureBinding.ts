import { useMemo } from "react";
import TextureManager from "../common/texture_manager";
import { createDataTextureBinding } from "../render/texture";

export default function useTextureBinding(
  format: GPUTextureFormat,
  width: number,
  height: number,
  initilizer?: (
    updater: (
      rect: [number, number, number, number], //  // x, y, width, height
      cb: (x: number, y: number) => number[]
    ) => void
  ) => void
) {
  const binding = useMemo(() => {
    const textureId = crypto.randomUUID();
    const { texture, update } = createDataTextureBinding(format, width, height);

    if (initilizer) {
      initilizer(update);
    }

    TextureManager.setTexture(textureId, texture);

    return {
      textureId,
      update,
    };
  }, []);

  return binding;
}
