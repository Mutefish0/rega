import { createVertexBinding, createIndexBinding } from "../vertex";

// quad vertex share all
export function createPlaneGeometry(width = 1, height = 1) {
  const width_half = width / 2;
  const height_half = height / 2;

  const widthSegments = 1;
  const heightSegments = 1;

  const gridX = Math.floor(widthSegments);
  const gridY = Math.floor(heightSegments);

  const gridX1 = gridX + 1;
  const gridY1 = gridY + 1;

  const segment_width = width / gridX;
  const segment_height = height / gridY;

  const indices = [];
  const vertices = [];
  const normals = [];
  const uvs = [];

  let vertexCount = 0;

  for (let iy = 0; iy < gridY1; iy++) {
    const y = iy * segment_height - height_half;

    for (let ix = 0; ix < gridX1; ix++) {
      const x = ix * segment_width - width_half;

      vertices.push(x, -y, 0);

      vertexCount++;

      normals.push(0, 0, 1);

      uvs.push(ix / gridX);
      uvs.push(iy / gridY);
    }
  }

  for (let iy = 0; iy < gridY; iy++) {
    for (let ix = 0; ix < gridX; ix++) {
      const a = ix + gridX1 * iy;
      const b = ix + gridX1 * (iy + 1);
      const c = ix + 1 + gridX1 * (iy + 1);
      const d = ix + 1 + gridX1 * iy;

      indices.push(a, b, d);
      indices.push(b, c, d);
    }
  }

  return {
    vertices,
    indices,
    normals,
    uvs,
    vertexCount,
  };
}

const { vertexCount, vertices, uvs, indices } = createPlaneGeometry();

const position = createVertexBinding("vec3", vertexCount).update(vertices);
const uv = createVertexBinding("vec2", vertexCount).update(uvs);

const index = {
  indexBuffer: createIndexBinding(indices.length).update(indices),
  indexCount: indices.length,
};

const vertex = {
  position,
  uv,
};

export default {
  vertexCount,
  vertex,
  index,
};
