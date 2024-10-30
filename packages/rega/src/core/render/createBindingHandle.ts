import {
  MaterialJSON,
  TransferBinding,
  BindingHandle,
  TransferResource,
} from "./types";
import sortBy from "lodash/sortBy";
import createSharedBuffer, {
  createFloat32Array,
  createVersionView,
  updateVersion,
} from "./createSharedBuffer";

interface Options {
  textures?: Record<
    string,
    { buffer: SharedArrayBuffer; width: number; height: number }
  >;
}

export default function createBindingHandle(
  material: MaterialJSON,
  options?: Options
): BindingHandle {
  const textures = options?.textures ?? {};

  const { bindings } = material;

  const transferBindings: TransferBinding[] = [];

  const bufferMap = new Map<
    string,
    { buffer: Float32Array; version: DataView }
  >();

  for (const bindGroup of bindings) {
    const { bindings, index } = bindGroup;

    const resources: TransferResource[] = [];

    bindings.forEach((binding) => {
      if (binding.type === "uniformBuffer") {
        const buffer = createSharedBuffer(binding.byteLength);
        const version = createVersionView(buffer);
        binding.uniforms.forEach((uniform) => {
          bufferMap.set(uniform.name, {
            buffer: createFloat32Array(buffer, uniform.offset),
            version,
          });
        });
        resources.push({ type: "uniformBuffer", buffer });
      } else if (binding.type === "sampler") {
        resources.push({ type: "sampler" });
      } else if (binding.type === "sampledTexture") {
        const texture = textures[binding.name];
        if (!texture) {
          throw new Error(`Texture not found: ${binding.name}`);
        }
        resources.push({
          type: "sampledTexture",
          buffer: texture.buffer,
          width: texture.width,
          height: texture.height,
        });
      }
    });

    transferBindings.push({
      groupIndex: index,
      resources,
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
