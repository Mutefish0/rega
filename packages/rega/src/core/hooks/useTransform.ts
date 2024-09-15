import { useContext, useMemo } from "react";
import TransformContext from "../primitives/TransformContext";
import { matrixToTransform } from "../math/transform";

export default function useTransform() {
  const ctx = useContext(TransformContext);

  const transform = useMemo(
    () => matrixToTransform(ctx.leafMatrix),
    [ctx.leafMatrix]
  );

  const relativeTransform = useMemo(
    () => matrixToTransform(ctx.relativeMatrix),
    [ctx.relativeMatrix]
  );

  const t = useMemo(
    () => ({
      transform,
      relativeTransform,
    }),
    []
  );

  t.relativeTransform = relativeTransform;
  t.transform = transform;

  return t;
}
