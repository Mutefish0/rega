import { MaterialJSON, TransferBinding, BindingHandle } from "./types";
import sortBy from "lodash/sortBy";
import createSharedBuffer from "./createSharedBuffer";
import { HEADER_SIZE } from "./sharedBufferLayout";

export default function createBindingHandle(
  material: MaterialJSON
): BindingHandle {
  const { bindings } = material;

  const transferBindings: TransferBinding[] = [];

  const bufferMap = new Map<string, Float32Array>();

  for (const bindGroup of bindings) {
    const { bindings, index } = bindGroup;
    const buffers: SharedArrayBuffer[] = [];

    bindings.forEach((binding) => {
      const buffer = createSharedBuffer(binding.byteLength);
      binding.uniforms.forEach((uniform) => {
        bufferMap.set(
          uniform.name,
          new Float32Array(buffer, HEADER_SIZE + uniform.offset)
        );
      });
      buffers.push(buffer);
    });

    transferBindings.push({
      groupIndex: index,
      buffers,
    });
  }

  return {
    transferBindings: sortBy(transferBindings, "groupIndex"),
    bufferMap,
  };
}
