import { createContext } from "react";
import { Matrix4 } from "three/webgpu";

// baseMatrix        - the matrix of the absolute parent
// relativeMatrix    - the matrix of the compose of relative parents
// leafMatrix        - the final matrix

export function createContextValues({
  baseMatrix,
  relativeMatrix,
}: {
  baseMatrix: Matrix4;
  relativeMatrix: Matrix4;
}) {
  return {
    baseMatrix,
    relativeMatrix,
    leafMatrix: baseMatrix.clone().multiply(relativeMatrix),
  };
}

export default createContext<ReturnType<typeof createContextValues>>({
  baseMatrix: new Matrix4(),
  relativeMatrix: new Matrix4(),
  leafMatrix: new Matrix4(),
});
