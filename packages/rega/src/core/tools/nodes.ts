import {
  positionGeometry,
  vec4,
  uniform,
  modelWorldMatrix,
  cameraProjectionMatrix,
  cameraViewMatrix,
} from "three/src/nodes/TSL.js";

const baseMatrix = cameraProjectionMatrix
  .mul(cameraViewMatrix)
  .mul(modelWorldMatrix);
