import { nodeProxy } from "three/src/nodes/tsl/TSLBase.js";
import { UnsignedIntType, IntType } from "three/src/constants.js";
import TextureNode from "./TextureNode";
import type { Node } from "../../core/types.ts";

const _texture = nodeProxy(TextureNode);

export type NodeTexture = Node<"vec4"> & { uvNode: Node<"vec2"> };

function texture(
  label: string,
  opts?: {
    sampler?: string;
  }
) {
  const t = _texture({
    isTexture: true,
    uuid: crypto.randomUUID(),
    samplerName: opts?.sampler,
  });

  if (label) {
    t.label(label);
  }

  const id = (
    (Date.now() % 10000000) +
    Math.ceil(Math.random() * 100000)
  ).toString(36);

  t.uuid = `texture_${label || ""}_${id}`;

  return t as NodeTexture;
}

function dataTexture<T extends GPUTextureFormat>(format: T, label: string) {
  const t = _texture({
    type: /uint/.test(format)
      ? UnsignedIntType
      : /sint/.test(format)
      ? IntType
      : undefined,
    internalFormat: format,
    isDataTexture: true,
    isTexture: true,
    uuid: crypto.randomUUID(),
  });
  t.label(label);
  t.setSampler(false);

  return t as Node<T extends "rgba8uint" ? "uvec4" : "vec4"> & {
    uvNode: Node<T extends "rgba8uint" ? "uvec2" : "vec2">;
  };
}

export { dataTexture };

export default texture;
