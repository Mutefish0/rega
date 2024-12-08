import {
  positionGeometry,
  vec4,
  modelWorldMatrix,
  cameraProjectionMatrix,
  cameraViewMatrix,
} from "pure3";

const basicVertexNode = cameraProjectionMatrix
  .mul(cameraViewMatrix)
  .mul(modelWorldMatrix)
  .mul(vec4(positionGeometry, 1));

export { basicVertexNode };
