import { WGSLValueType } from "pure3";
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

  // bytesPerRow = Math.ceil(bytesPerRow / 256) * 256; // Align to 256 bytes

  const byteLength = width * height * bytesPerTexel;

  const sab = createSharedBuffer(byteLength);

  const versionView = createVersionView(sab);

  const areaView = new Uint16Array(sab, HEADER_SIZE, 4);
  const dataHeaderView = new Uint32Array(sab, HEADER_SIZE + 8, 2);

  const v = (viewerMap as any)[format];

  if (!v) {
    throw new Error(`Unsupported Texture DataView: ${format}`);
  }

  const [viewer, channel] = v;

  const dataView = new viewer(sab, HEADER_SIZE + 16);

  // 16bytes header
  // u16,u16,u16,u16 - u32,u32
  // x, y, width, height. data-bytes-offset,data-bytes-per-row

  const origin = [20, 20];
  const size = [100, 100];
  const dataOffset = [];

  function update(
    [x, y, width, height]: [number, number, number, number],
    cb: (x: number, y: number) => number[]
  ) {
    const offset = y * width * bytesPerTexel + x * bytesPerTexel;

    for (let i = 0; i < height; i++) {
      for (let j = 0; j < width; j++) {
        const values = cb(j, i);
        for (let k = 0; k < channel; k++) {
          // dataView[offset + i * width * bytesPerTexel + j * bytesPerTexel + k] =
          //   values[k];
        }

        // const offset = (y + i) * width + x + j;
        // const data = cb(j, i);
        // dataOffset[offset] = data;
      }
    }
    //
  }

  //const v = createUniformValueBindingView(sab, type);

  // const resource: TransferResource = {
  //   type: "uniformBuffer",
  //   buffer: sab,
  // };

  // return {
  //   resource,
  //   update: v.update,
  // };
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
