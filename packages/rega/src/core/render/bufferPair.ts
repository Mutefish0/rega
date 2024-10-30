import { getUUID, HEADER_SIZE } from "./sharedBufferLayout";

const buffersMap = new Map<
  string,
  {
    version: number;

    gpuBuffer: GPUBuffer;
    refenceCount: number;
    usage: GPUBufferUsageFlags;
  }
>();

export function getGPUBuffer(sab: SharedArrayBuffer) {
  const uuid = getUUID(sab);
  return buffersMap.get(uuid)!.gpuBuffer;
}

function usageToString(usage: GPUBufferUsageFlags) {
  if (usage & GPUBufferUsage.VERTEX) {
    return "vertex";
  } else if (usage & GPUBufferUsage.INDEX) {
    return "index";
  } else if (usage & GPUBufferUsage.UNIFORM) {
    return "uniform";
  } else if (usage & GPUBufferUsage.STORAGE) {
    return "storage";
  }
}

export function addObjectGPUBuffer(
  device: GPUDevice,
  sab: SharedArrayBuffer,
  usage: GPUBufferUsageFlags
) {
  const uuid = getUUID(sab);
  let record = buffersMap.get(uuid);
  if (!record) {
    const gpuBuffer = device.createBuffer({
      size: sab.byteLength - HEADER_SIZE,
      usage,
      mappedAtCreation: true,
    });

    console.debug(`create <${usageToString(usage)}> buffer: ${sab.byteLength}`);
    const mappedRange = gpuBuffer.getMappedRange();
    new Uint8Array(mappedRange).set(new Uint8Array(sab, HEADER_SIZE));
    gpuBuffer.unmap();

    record = {
      version: 0,
      gpuBuffer,
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
        `destroy <${usageToString(record.usage)}> buffer: ${sab.byteLength}`
      );
    }
  }
}

export function updateGPUBuffer(device: GPUDevice, sab: SharedArrayBuffer) {
  // @TODO update based on the version
  const buffer = getGPUBuffer(sab);
  device.queue.writeBuffer(buffer, 0, new Uint8Array(sab, HEADER_SIZE), 0);
  return buffer;
}
