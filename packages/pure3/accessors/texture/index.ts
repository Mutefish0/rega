import { nodeProxy } from "three/src/nodes/tsl/TSLBase.js";
import TextureNode from "./TextureNode";
import type { Node } from "../../core/types.ts";

const _texture = nodeProxy(TextureNode);

function texture(label: string) {
  const t = _texture({
    isTexture: true,
    uuid: crypto.randomUUID(),
  });
  if (label) {
    t.label(label);
  }
  return t as Node<"vec4"> & { uvNode: Node<"vec2"> };
}

function dataTexture(format: GPUTextureFormat, label: string) {
  const t = _texture({
    internalFormat: format,
    isDataTexture: true,
    isTexture: true,
    uuid: crypto.randomUUID(),
  });
  t.label(label);
  return t as Node<"vec4"> & { uvNode: Node<"vec2"> };
}

export { dataTexture };

export default texture;
