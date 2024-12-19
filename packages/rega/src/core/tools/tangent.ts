import { GLTFMesh } from "./gltf";
import { createFloat32Array } from "../render/createSharedBuffer";
import { createVertexBinding } from "../render/vertex";
import { Vector3, Vector2, Matrix3 } from "pure3";

export function computeTangent(
  vertexCount: number,
  position: SharedArrayBuffer,
  uv: SharedArrayBuffer
) {
  const positionView = createFloat32Array(position);
  const uvView = createFloat32Array(uv);

  //   const tangentBinding = createVertexBinding("vec3", geometry.vertexCount);
  //   const biTangentBinding = createVertexBinding("vec3", geometry.vertexCount);

  for (let i = 0; i < vertexCount; i++) {
    const posBaseIndex = i * 3 * 3;
    const uvBaseIndex = i * 2 * 3;

    const p0 = [
      positionView[posBaseIndex],
      positionView[posBaseIndex + 1],
      positionView[posBaseIndex + 2],
    ];
    const p1 = [
      positionView[posBaseIndex + 3],
      positionView[posBaseIndex + 4],
      positionView[posBaseIndex + 5],
    ];
    const p2 = [
      positionView[posBaseIndex + 6],
      positionView[posBaseIndex + 7],
      positionView[posBaseIndex + 8],
    ];

    const uv0 = [uvView[uvBaseIndex], uvView[uvBaseIndex + 1]];
    const uv1 = [uvView[uvBaseIndex + 2], uvView[uvBaseIndex + 3]];
    const uv2 = [uvView[uvBaseIndex + 4], uvView[uvBaseIndex + 5]];

    // p1 - p0
    const E1 = [p1[0] - p0[0], p1[1] - p0[1], p1[2] - p0[2]];
    const E2 = [p2[0] - p0[0], p2[1] - p0[1], p2[2] - p0[2]];

    // uv1 - uv0
    const UV1 = [uv1[0] - uv0[0], uv1[1] - uv0[1]];
    const UV2 = [uv2[0] - uv0[0], uv2[1] - uv0[1]];

    const matrix = new Matrix3().set(
      E1[0],
      E2[0],
      0,
      E1[1],
      E2[1],
      0,
      UV1[0],
      UV2[0],
      1
    );

    const solution = new Vector3();
    solution.setFromMatrix3Column(matrix, 2);

    const uAxis = new Vector3(solution.x, solution.y, 0).normalize();
    const vAxis = new Vector3(0, 0, solution.z).normalize();

    console.log(uAxis, vAxis);
  }
}
