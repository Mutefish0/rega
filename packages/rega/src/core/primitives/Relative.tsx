import { ReactNode, useMemo, useContext } from "react";
import TransformContext, { createContextValues } from "./TransformContext";
import { Matrix4 } from "pure3";
import { keyStringify } from "../tools/key";
import { transformToMatrix } from "../math/transform";

interface Props {
  matrix?: Matrix4;
  translation?: { x?: number; y?: number; z?: number };
  rotation?: { x?: number; y?: number; z?: number };
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
        rotation: {
          x: rotation?.x ?? 0,
          y: rotation?.y ?? 0,
          z: rotation?.z ?? 0,
        },
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
