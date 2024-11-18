import { uniform, vec4 } from "../index";

const zIndex = uniform("float", "zIndex");
const normZIndex = zIndex.div(zIndex.add(1));
export const zIndexBias = vec4(0, 0, normZIndex.div(-1_000), 0);
