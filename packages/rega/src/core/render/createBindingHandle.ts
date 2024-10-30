import { MaterialJSON, TransferBinding, BindingHandle } from "./types";
import sortBy from "lodash/sortBy";
import createSharedBuffer, {
  createFloat32Array,
  createVersionView,
  updateVersion,
} from "./createSharedBuffer";

export default function createBindingHandle(
  material: MaterialJSON
): BindingHandle {
  const { bindings } = material;

  const transferBindings: TransferBinding[] = [];

  const bufferMap = new Map<
    string,
    { buffer: Float32Array; version: DataView }
  >();

  for (const bindGroup of bindings) {
    const { bindings, index } = bindGroup;
    const buffers: SharedArrayBuffer[] = [];

    bindings.forEach((binding) => {
      const buffer = createSharedBuffer(binding.byteLength);
      binding.uniforms.forEach((uniform) => {
        bufferMap.set(uniform.name, {
          buffer: createFloat32Array(buffer),
          version: createVersionView(buffer),
        });
      });
      buffers.push(buffer);
    });

    transferBindings.push({
      groupIndex: index,
      buffers,
    });
  }

  function update(name: string, value: number[]) {
    const buf = bufferMap.get(name);
    if (buf) {
      buf.buffer.set(value);
      updateVersion(buf.version);
    }
  }

  return {
    transferBindings: sortBy(transferBindings, "groupIndex"),
    update,
  };
}
