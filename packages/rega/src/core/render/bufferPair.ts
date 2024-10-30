import { getUUID, HEADER_SIZE } from "./sharedBufferLayout";

const buffersMap = new Map<
  string,
  {
    version: number;
    gpuBuffer: GPUBuffer;
    cpuUint8Array: Uint8Array;
    cpuUint16Array: Uint16Array;
    cpuFloat32Array: Float32Array;
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
  const size = sab.byteLength - HEADER_SIZE;
  if (!record) {
    const gpuBuffer = device.createBuffer({
      size,
      usage,
      mappedAtCreation: true,
    });
    console.debug(
      `[buffer ${uuid}] create, <${usageToString(usage)}>, ${size}`
    );

    const cpuUint8Array = new Uint8Array(sab, HEADER_SIZE);

    const mappedRange = gpuBuffer.getMappedRange();
    new Uint8Array(mappedRange).set(cpuUint8Array);
    gpuBuffer.unmap();

    record = {
      version: 0,
      gpuBuffer,
      cpuUint8Array: cpuUint8Array,
      cpuUint16Array: new Uint16Array(sab, HEADER_SIZE),
      cpuFloat32Array: new Float32Array(sab, HEADER_SIZE),
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
        `[buffer ${uuid}] destroy, <${usageToString(record.usage)}>`
      );
    }
  }
}

export function updateGPUBuffer(device: GPUDevice, sab: SharedArrayBuffer) {
  // @TODO update based on the version
  const uuid = getUUID(sab);
  const record = buffersMap.get(uuid)!;

  device.queue.writeBuffer(record.gpuBuffer, 0, record.cpuUint8Array, 0);

  // console.debug(
  //   `[buffer ${uuid}] write, <${usageToString(record.usage)}>`,
  //   record.cpuFloat32Array
  // );

  return record.gpuBuffer;
}
