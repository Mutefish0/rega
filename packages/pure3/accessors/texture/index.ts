import { nodeProxy } from "three/src/nodes/tsl/TSLBase.js";
import TextureNode from "./TextureNode";

import type { UniformNode } from "../../core/types.ts";

const _texture = nodeProxy(TextureNode);

function texture() {
  return _texture({
    isTexture: true,
  }) as UniformNode<"vec4">;
}

export default texture;
