import { getUUID, HEADER_SIZE } from "./sharedBufferLayout";
import { createVersionView, getVersion } from "./createSharedBuffer";

const buffersMap = new Map<
  string,
  {
    version: number;
    gpuBuffer: GPUBuffer;
    cpuUint8Array: Uint8Array;
    versionView: DataView;
    refenceCount: number;
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
    refenceCount: number;
    usage: GPUTextureUsageFlags;
  }
>();

export function getGPUBuffer(sab: SharedArrayBuffer) {
  const uuid = getUUID(sab);
  return buffersMap.get(uuid)!.gpuBuffer;
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
  sab: SharedArrayBuffer,
  usage: GPUBufferUsageFlags
) {
  const uuid = getUUID(sab);
  let record = buffersMap.get(uuid);
  const size = sab.byteLength - HEADER_SIZE;
  if (!record) {
    const gpuBuffer = device.createBuffer({
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
      refenceCount: 1,
      usage,
    };

    buffersMap.set(uuid, record);

    return gpuBuffer;
  } else {
    record.refenceCount++;

    return record.gpuBuffer;
  }
}

export function removeObjectGPUBuffer(sab: SharedArrayBuffer) {
  const uuid = getUUID(sab);
  const record = buffersMap.get(uuid);
  if (record) {
    record.refenceCount--;
    if (record.refenceCount === 0) {
      record.gpuBuffer.destroy();
      buffersMap.delete(uuid);
      console.debug(
        `[buffer ${uuid}] destroy, <${usageToString("buffer", record.usage)}>`
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
