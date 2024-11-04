import { parseUUID, HEADER_SIZE } from "./sharedBufferLayout";
import { createVersionView, getVersion } from "./createSharedBuffer";

const idsMap = new Map<SharedArrayBuffer, string>();

const buffersMap = new Map<
  string,
  {
    version: number;
    gpuBuffer: GPUBuffer;
    cpuUint8Array: Uint8Array;
    versionView: DataView;
    referenceCount: number;
    usage: GPUBufferUsageFlags;
  }
>();

const texturesMap = new Map<
  string,
  {
    version: number;
    gpuTexture: GPUTexture;
    cpuUint8Array: Uint8Array;
    versionView: DataView;
    referenceCount: number;
    usage: GPUTextureUsageFlags;
    width: number;
    height: number;
    bytesPerRow: number;
  }
>();

const samplerMap = new Map<string, GPUSampler>();

function getUUID(sab: SharedArrayBuffer) {
  let id = idsMap.get(sab);
  if (!id) {
    id = parseUUID(sab);
    idsMap.set(sab, id);
  }
  return id;
}

function usageToString(type: "buffer" | "texture", usage: GPUBufferUsageFlags) {
  if (type === "buffer") {
    if (usage & GPUBufferUsage.VERTEX) {
      return "vertex";
    } else if (usage & GPUBufferUsage.INDEX) {
      return "index";
    } else if (usage & GPUBufferUsage.UNIFORM) {
      return "uniform";
    } else if (usage & GPUBufferUsage.STORAGE) {
      return "storage";
    }
  } else if (type === "texture") {
    if (usage & GPUTextureUsage.TEXTURE_BINDING) {
      return "texture_binding";
    }
  }
  return "unknown";
}

export function addObjectGPUBuffer(
  device: GPUDevice,
  label: string,
  sab: SharedArrayBuffer,
  usage: GPUBufferUsageFlags
) {
  const uuid = getUUID(sab);
  let record = buffersMap.get(uuid);
  const size = sab.byteLength - HEADER_SIZE;
  if (!record) {
    const gpuBuffer = device.createBuffer({
      label,
      size,
      usage,
      mappedAtCreation: true,
    });
    console.debug(
      `[buffer ${uuid}] create, <${usageToString("buffer", usage)}>, ${size}`
    );

    const cpuUint8Array = new Uint8Array(sab, HEADER_SIZE);

    const mappedRange = gpuBuffer.getMappedRange();
    new Uint8Array(mappedRange).set(cpuUint8Array);
    gpuBuffer.unmap();

    record = {
      version: 0,
      gpuBuffer,
      cpuUint8Array: cpuUint8Array,
      versionView: createVersionView(sab),
      referenceCount: 1,
      usage,
    };

    buffersMap.set(uuid, record);

    return gpuBuffer;
  } else {
    record.referenceCount++;

    return record.gpuBuffer;
  }
}

export function removeObjectGPUBuffer(sab: SharedArrayBuffer) {
  const uuid = getUUID(sab);
  const record = buffersMap.get(uuid);
  if (record) {
    record.referenceCount--;
    if (record.referenceCount === 0) {
      record.gpuBuffer.destroy();
      buffersMap.delete(uuid);
      idsMap.delete(sab);
      console.debug(
        `[buffer ${uuid}] destroy, <${usageToString("buffer", record.usage)}>`
      );
    }
  }
}

export function addObjectGPUTexture(
  device: GPUDevice,
  label: string,
  sab: SharedArrayBuffer,
  opts: {
    usage: GPUTextureUsageFlags;
    width: number;
    height: number;
  }
) {
  const uuid = getUUID(sab);
  const format = "rgba8unorm";
  let record = texturesMap.get(uuid);
  const size = sab.byteLength - HEADER_SIZE;
  if (!record) {
    const gpuTexture = device.createTexture({
      label,
      size: {
        width: opts.width,
        height: opts.height,
        depthOrArrayLayers: 1,
      },
      format,
      usage: opts.usage,
    });

    console.debug(
      `[buffer ${uuid}] create, <${usageToString(
        "texture",
        opts.usage
      )}>, ${size}`
    );

    const cpuUint8Array = new Uint8Array(sab, HEADER_SIZE);

    const bytesPerTexel = getBytesPerTexel(format);

    let bytesPerRow = opts.width * bytesPerTexel;
    bytesPerRow = Math.ceil(bytesPerRow / 256) * 256; // Align to 256 bytes

    record = {
      version: 0,
      gpuTexture,
      cpuUint8Array: cpuUint8Array,
      versionView: createVersionView(sab),
      referenceCount: 1,
      usage: opts.usage,
      width: opts.width,
      height: opts.height,
      bytesPerRow,
    };
    texturesMap.set(uuid, record);

    return gpuTexture;
  } else {
    record.referenceCount++;
    return record.gpuTexture;
  }
}

export function addObjectGPUSampler(device: GPUDevice, opts: {}) {
  const key = JSON.stringify(opts);
  let sampler = samplerMap.get(key);
  if (!sampler) {
    sampler = device.createSampler(opts);
    samplerMap.set(key, sampler);
  }
  return sampler;
}

export function removeObjectGPUTexture(sab: SharedArrayBuffer) {
  const uuid = getUUID(sab);
  const record = texturesMap.get(uuid);
  if (record) {
    record.referenceCount--;
    if (record.referenceCount === 0) {
      record.gpuTexture.destroy();
      texturesMap.delete(uuid);
      idsMap.delete(sab);
      console.debug(
        `[buffer ${uuid}] destroy, <${usageToString("texture", record.usage)}>`
      );
    }
  }
}

export function updateGPUBuffer(device: GPUDevice, sab: SharedArrayBuffer) {
  const uuid = getUUID(sab);
  const record = buffersMap.get(uuid)!;

  const version = getVersion(record.versionView);

  if (record.version < version) {
    record.version = version;
    device.queue.writeBuffer(record.gpuBuffer, 0, record.cpuUint8Array, 0);
    console.debug(
      `[buffer ${uuid}] write, <${usageToString("buffer", record.usage)}>`,
      "version: ",
      version
    );
  }

  return record.gpuBuffer;
}

export function updateGPUTexture(device: GPUDevice, sab: SharedArrayBuffer) {
  const uuid = getUUID(sab);
  const record = texturesMap.get(uuid)!;

  const version = getVersion(record.versionView);

  if (record.version < version) {
    record.version = version;

    device.queue.writeTexture(
      { texture: record.gpuTexture },
      record.cpuUint8Array, // 提前准备的数据
      { bytesPerRow: record.bytesPerRow },
      [record.width, record.height, 1]
    );

    console.log('write texture', record.cpuUint8Array);

    console.debug(
      `[buffer ${uuid}] write, <${usageToString("texture", record.usage)}>`,
      "version: ",
      version
    );
  }

  return record.gpuTexture;
}

function getBytesPerTexel(format: GPUTextureFormat) {
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
