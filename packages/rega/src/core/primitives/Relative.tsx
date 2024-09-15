import { ReactNode, useMemo, useContext } from "react";
import TransformContext, { createContextValues } from "./TransformContext";
import { Matrix4 } from "three/webgpu";
import { Vector3Like } from "three";
import { keyStringify } from "../tools/key";
import { transformToMatrix } from "../math/transform";

interface Props {
  matrix?: Matrix4;
  translation?: { x?: number; y?: number; z?: number };
  rotation?: Vector3Like;
  children: ReactNode;
}

export default function Relative({
  translation,
  rotation,
  matrix,
  children,
}: Props) {
  const parentCtx = useContext(TransformContext);

  const relativeMatrix = useMemo(
    () =>
      matrix ??
      transformToMatrix({
        translation: {
          x: translation?.x ?? 0,
          y: translation?.y ?? 0,
          z: translation?.z ?? 0,
        },
        rotation,
      }),
    [keyStringify(translation), keyStringify(rotation), matrix]
  );

  const ctx = useMemo(
    () =>
      createContextValues({
        baseMatrix: parentCtx.baseMatrix,
        relativeMatrix: parentCtx.relativeMatrix
          .clone()
          .multiply(relativeMatrix),
      }),
    [relativeMatrix, parentCtx]
  );

  return (
    <TransformContext.Provider value={ctx}>
      {children}
    </TransformContext.Provider>
  );
}
