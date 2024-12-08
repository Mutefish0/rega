import { createVertexBinding, createIndexBinding } from "../vertex";

const vertexCount = 36;

const position = createVertexBinding("vec3", vertexCount).update([
  // 前面
  -0.5,
  -0.5,
  0.5, // 左下
  0.5,
  -0.5,
  0.5, // 右下
  0.5,
  0.5,
  0.5, // 右上
  -0.5,
  0.5,
  0.5, // 左上

  // 后面
  -0.5,
  -0.5,
  -0.5, // 左下
  0.5,
  -0.5,
  -0.5, // 右下
  0.5,
  0.5,
  -0.5, // 右上
  -0.5,
  0.5,
  -0.5, // 左上
]);
const uv = createVertexBinding("vec2", vertexCount).update([
  // 前面
  0.0,
  0.0, // 左下
  1.0,
  0.0, // 右下
  1.0,
  1.0, // 右上
  0.0,
  1.0, // 左上

  // 后面
  0.0,
  0.0, // 左下
  1.0,
  0.0, // 右下
  1.0,
  1.0, // 右上
  0.0,
  1.0, // 左上
]);
const normal = createVertexBinding("vec3", vertexCount).update([
  // 前面
  0.0,
  0.0,
  1.0, // 正向
  0.0,
  0.0,
  1.0, // 正向
  0.0,
  0.0,
  1.0, // 正向
  0.0,
  0.0,
  1.0, // 正向

  // 后面
  0.0,
  0.0,
  -1.0, // 反向
  0.0,
  0.0,
  -1.0, // 反向
  0.0,
  0.0,
  -1.0, // 反向
  0.0,
  0.0,
  -1.0, // 反向
]);

const indices = [
  // 前面
  0, 1, 2, 0, 2, 3,

  // 后面
  4, 5, 6, 4, 6, 7,

  // 左面
  8, 9, 10, 8, 10, 11,

  // 右面
  12, 13, 14, 12, 14, 15,

  // 上面
  16, 17, 18, 16, 18, 19,

  // 下面
  20, 21, 22, 20, 22, 23,
];

const index = {
  indexBuffer: createIndexBinding(indices.length).update(indices),
  indexCount: indices.length,
};

const vertex = {
  position,
  uv,
  normal,
};

export default {
  vertexCount,
  vertex,
  index,
};
