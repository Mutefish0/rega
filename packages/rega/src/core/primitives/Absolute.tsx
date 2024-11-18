import { ReactNode, useMemo } from "react";
import TransformContext, { createContextValues } from "./TransformContext";
import { Vector3Like, Matrix4 } from "pure3";
import { transformToMatrix } from "../math/transform";
import { keyStringify } from "../tools/key";
import useTransform from "../hooks/useTransform";

interface Props {
  matrix?: Matrix4;
  translation?: { x?: number; y?: number; z?: number };
  rotation?: Vector3Like;
  children: ReactNode;
}

export default function Absolute({
  translation,
  rotation,
  matrix,
  children,
}: Props) {
  const trans = useTransform();

  const baseMatrix = useMemo(() => {
    if (matrix) {
      return matrix;
    }
    return transformToMatrix({
      translation: { ...trans.transform.translation, ...translation },
      rotation,
    });
  }, [keyStringify(translation), keyStringify(rotation), matrix]);

  const ctx = useMemo(
    () =>
      createContextValues({
        baseMatrix,
        relativeMatrix: new Matrix4(),
      }),
    [baseMatrix]
  );

  return (
    <TransformContext.Provider value={ctx}>
      {children}
    </TransformContext.Provider>
  );
}
