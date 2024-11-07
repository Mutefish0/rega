import { parseUUID, HEADER_SIZE } from "./sharedBufferLayout";
import { createVersionView, getVersion } from "./createSharedBuffer";
import { getBytesPerTexel } from "./texture";

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

// textureId -> texture
const texturesMap = new Map<
  string,
  {
    gpuTexture: GPUTexture;
    referenceCount: number;
    usage: GPUTextureUsageFlags;
  }
>();

const mutableTexturesMap = new Map<
  string,
  {
    version: number;
    gpuTexture: GPUTexture;
    cpuBuffer: SharedArrayBuffer;
    usage: GPUTextureUsageFlags;
    format: GPUTextureFormat;
    width: number;
    height: number;
    referenceCount: number;
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
  textureId: string,
  sab: SharedArrayBuffer,
  opts: {
    format: GPUTextureFormat;
    usage: GPUTextureUsageFlags;
    width: number;
    height: number;
  }
) {
  let record = texturesMap.get(textureId);
  const size = sab.byteLength;
  if (!record) {
    const gpuTexture = device.createTexture({
      label,
      size: {
        width: opts.width,
        height: opts.height,
        depthOrArrayLayers: 1,
      },
      format: opts.format,
      usage: opts.usage,
    });

    const data = new Uint8Array(sab);
    const bytesPerTexel = getBytesPerTexel(opts.format);
    let bytesPerRow = opts.width * bytesPerTexel;
    bytesPerRow = Math.ceil(bytesPerRow / 256) * 256; // Align to 256 bytes

    device.queue.writeTexture(
      { texture: gpuTexture },
      data, // 提前准备的数据
      { bytesPerRow },
      [opts.width, opts.height, 1]
    );

    record = {
      gpuTexture,
      referenceCount: 1,
      usage: opts.usage,
    };

    texturesMap.set(textureId, record);

    console.debug(
      `[textre ${textureId}] create, <${usageToString(
        "texture",
        opts.usage
      )}>, ${size}`
    );

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

export function removeObjectGPUTexture(textureId: string) {
  const record = texturesMap.get(textureId);
  if (record) {
    record.referenceCount--;
    if (record.referenceCount === 0) {
      record.gpuTexture.destroy();
      texturesMap.delete(textureId);
      console.debug(
        `[texture ${textureId}] destroy, <${usageToString(
          "texture",
          record.usage
        )}>`
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
      `[buffer ${uuid}] write <${record.gpuBuffer.label}>`,
      `v${version}`
    );
  }

  return record.gpuBuffer;
}
