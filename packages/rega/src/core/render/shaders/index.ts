import {
  normalGeometry,
  vec4,
  modelWorldMatrix,
  cameraProjectionMatrix,
  cameraViewMatrix,
  positionGeometry,
} from "pure3";

const basicVertexNode = cameraProjectionMatrix
  .mul(cameraViewMatrix)
  .mul(modelWorldMatrix)
  .mul(vec4(positionGeometry, 1));

const worldNormalNode = modelWorldMatrix.mul(vec4(normalGeometry, 1)).xyz;

export { basicVertexNode, worldNormalNode };
