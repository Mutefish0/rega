import TextureManager from "../common/texture_manager";
import { texture, WGSLValueType } from "pure3";
import createSharedBuffer, {
  createUint16Array,
  createFloat32Array,
  createVersionView,
  updateVersion,
  HEADER_SIZE,
} from "./createSharedBuffer";

const viewerMap = {
  r8unorm: [Uint8Array, 1],
  r8snorm: [Int8Array, 1],
  r8uint: [Uint8Array, 1],
  r8sint: [Int8Array, 1],

  rgba8unorm: [Uint8Array, 4],
  rgba8snorm: [Int8Array, 4],
  rgba8uint: [Uint8Array, 4],
  rgba8sint: [Int8Array, 4],

  r16uint: [Uint16Array, 1],
  r16sint: [Int16Array, 1],
  rg16uint: [Uint16Array, 2],
  rg16sint: [Int16Array, 2],

  r32uint: [Uint32Array, 1],
  r32sint: [Int32Array, 1],
};

export function createDataTextureBinding(
  format: GPUTextureFormat,
  width: number,
  height: number
) {
  const bytesPerTexel = getBytesPerTexel(format);
  let bytesPerRow = width * bytesPerTexel;
  bytesPerRow = Math.ceil(bytesPerRow / 256) * 256; // Align to 256 bytes

  const byteLength = 16 + bytesPerRow * height;

  const sab = createSharedBuffer(byteLength);

  const versionView = createVersionView(sab);

  // dest
  // origin   x, y  // 2 + 2
  // === data-layout
  // offset, bytesPerRow  // 4 + 4
  // === size
  // pixelWidth, pixelHeight //  2 + 2

  const destOriginView = new Uint16Array(sab, HEADER_SIZE, 3); // x, y, z
  const dataLayoutView = new Uint32Array(sab, HEADER_SIZE + 4, 2); // offset, bytesPerRow
  const sizeView = new Uint16Array(sab, HEADER_SIZE + 12, 3); // x, y, z

  const v = (viewerMap as any)[format];

  if (!v) {
    throw new Error(`Unsupported Texture DataView: ${format}`);
  }

  const [viewer, channel] = v;

  // 1d, 2d
  function update(
    origin: [number, number], // x, y
    size: [number, number],
    cb: (x: number, y: number) => number[]
  ) {
    let destStartOffset = bytesPerRow * origin[1] + origin[0] * bytesPerTexel;

    destOriginView.set(origin);
    sizeView.set(size);

    dataLayoutView.set([HEADER_SIZE + 16 + destStartOffset, bytesPerRow]);

    for (let i = 0; i < size[1]; i++) {
      const view = new viewer(
        sab,
        HEADER_SIZE + 16 + destStartOffset + i * bytesPerRow
      );
      for (let j = 0; j < size[0]; j++) {
        const values = cb(j, i);
        for (let k = 0; k < channel; k++) {
          view[j * channel + k] = values[k];
        }
      }
    }

    updateVersion(versionView);
  }

  const id = crypto.randomUUID();

  TextureManager.setTexture(id, {
    type: "sampledTexture",
    buffer: sab,
    format,
    width,
    height,
    immutable: false,
  });

  return {
    textureId: id,
    update,
  };
}

export function getBytesPerTexel(format: GPUTextureFormat) {
  // 8-bit formats
  if (
    format === "r8unorm" ||
    format === "r8snorm" ||
    format === "r8uint" ||
    format === "r8sint"
  )
    return 1;

  // 16-bit formats
  if (
    format === "r16uint" ||
    format === "r16sint" ||
    format === "r16float" ||
    format === "rg8unorm" ||
    format === "rg8snorm" ||
    format === "rg8uint" ||
    format === "rg8sint"
  )
    return 2;

  // 32-bit formats
  if (
    format === "r32uint" ||
    format === "r32sint" ||
    format === "r32float" ||
    format === "rg16uint" ||
    format === "rg16sint" ||
    format === "rg16float" ||
    format === "rgba8unorm" ||
    format === "rgba8unorm-srgb" ||
    format === "rgba8snorm" ||
    format === "rgba8uint" ||
    format === "rgba8sint" ||
    format === "bgra8unorm" ||
    format === "bgra8unorm-srgb" ||
    // Packed 32-bit formats
    format === "rgb9e5ufloat" ||
    format === "rgb10a2unorm" ||
    format === "rg11b10ufloat" ||
    format === "depth32float" ||
    format === "depth24plus" ||
    format === "depth24plus-stencil8" ||
    format === "depth32float-stencil8"
  )
    return 4;

  // 64-bit formats
  if (
    format === "rg32uint" ||
    format === "rg32sint" ||
    format === "rg32float" ||
    format === "rgba16uint" ||
    format === "rgba16sint" ||
    format === "rgba16float"
  )
    return 8;

  // 128-bit formats
  if (
    format === "rgba32uint" ||
    format === "rgba32sint" ||
    format === "rgba32float"
  )
    return 16;

  // Return undefined or handle unsupported format
  throw new Error(`Unsupported GPUTextureFormat: ${format}`);
}
