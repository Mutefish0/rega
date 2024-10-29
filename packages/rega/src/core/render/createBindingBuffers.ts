import { MaterialJSON, TransferBinding, BindingHandle } from "./types";

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
      const buffer = new SharedArrayBuffer(binding.byteLength);
      binding.uniforms.forEach((uniform) => {
        bufferMap.set(uniform.name, new Float32Array(buffer, uniform.offset));
      });
      buffers.push(buffer);
    });

    transferBindings.push({
      groupIndex: index,
      buffers,
    });
  }

  return {
    transferBindings,
    bufferMap,
  };
}
