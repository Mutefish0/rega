import { nodeProxy } from "three/src/nodes/tsl/TSLBase.js";
import TextureNode from "./TextureNode";
import type { Node } from "../../core/types.ts";

const _texture = nodeProxy(TextureNode);

function texture(label?: string) {
  const t = _texture({
    isTexture: true,
  });
  if (label) {
    t.label(label);
  }
  return t as Node<"vec4">;
}

export default texture;
