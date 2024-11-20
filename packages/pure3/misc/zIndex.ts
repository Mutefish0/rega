import { uniform, vec4 } from "../index";

const zIndex = uniform("float", "zIndex");

// shift-50
const zIndexShift = zIndex.add(50);
const normZIndex = zIndexShift.div(zIndexShift.add(100));
export const zIndexBias = vec4(0, 0, normZIndex.div(-100), 0);
