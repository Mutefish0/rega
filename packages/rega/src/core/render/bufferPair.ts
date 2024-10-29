const buffersMap = new Map<
  SharedArrayBuffer,
  {
    version: number;
    gpuBuffer: GPUBuffer;
    refenceCount: number;
  }
>();

export function getGPUBuffer(sab: SharedArrayBuffer) {
  return buffersMap.get(sab)!.gpuBuffer;
}

export function addObjectGPUBuffer(
  device: GPUDevice,
  sab: SharedArrayBuffer,
  usage: GPUBufferUsageFlags
) {
  let record = buffersMap.get(sab);
  if (!record) {
    const gpuBuffer = device.createBuffer({
      size: sab.byteLength,
      usage,
      mappedAtCreation: true,
    });
    const mappedRange = gpuBuffer.getMappedRange();
    new Uint8Array(mappedRange).set(new Uint8Array(sab));
    gpuBuffer.unmap();

    record = {
      version: 0,
      gpuBuffer,
      refenceCount: 1,
    };

    buffersMap.set(sab, record);

    return gpuBuffer;
  } else {
    record.refenceCount++;

    return record.gpuBuffer;
  }
}

export function removeObjectGPUBuffer(sab: SharedArrayBuffer) {
  const record = buffersMap.get(sab);
  if (record) {
    record.refenceCount--;
    if (record.refenceCount === 0) {
      record.gpuBuffer.destroy();
      buffersMap.delete(sab);
    }
  }
}

export function updateGPUBuffer(device: GPUDevice, sab: SharedArrayBuffer) {
  // @TODO update based on the version
  device.queue.writeBuffer(getGPUBuffer(sab), 0, sab, 0);
}
