import React, { useContext, useEffect, useMemo } from "react";
import TransformContext from "./TransformContext";
import { useTargetBindingView } from "./RenderTarget";
import { WebGPUCoordinateSystem } from "three/src/constants.js";
import { DEG2RAD } from "three/src/math/MathUtils.js";
import { mainTarget } from "./RenderTarget";

import { Matrix4 } from "pure3";

interface CommonProps {
  targetId?: string;
}

interface PerspectiveProps {
  type: "perspective";
  fov?: number;
  aspect?: number;
  near?: number;
  far?: number;
  width?: never;
  height?: never;
}

interface OrthographicProps {
  type: "orthographic";
  fov?: never;
  aspect?: never;
  width: number;
  height: number;
  near?: number;
  far?: number;
}

type Props = (PerspectiveProps | OrthographicProps) & CommonProps;

export default function Camera({
  targetId = mainTarget,
  type,
  width,
  height,

  fov = 50,
  aspect = 1,
  near = 0.1,
  far = 2000,
}: Props) {
  const transform = useContext(TransformContext);

  const projectionMatrix = useMemo(() => {
    if (type === "perspective") {
      let top = near * Math.tan(DEG2RAD * 0.5 * fov);
      let height = 2 * top;
      let width = aspect * height;
      let left = -0.5 * width;

      return new Matrix4().makePerspective(
        left,
        left + width,
        top,
        top - height,
        near,
        far,
        WebGPUCoordinateSystem
      );
    } else if (type === "orthographic") {
      const half = width / 2;
      const left = -half;
      const right = half;
      const halfH = height / 2;
      const top = halfH;
      const bottom = -halfH;

      return new Matrix4().makeOrthographic(
        left,
        right,
        top,
        bottom,
        near,
        far,
        WebGPUCoordinateSystem
      );
    } else {
      throw new Error(`Invalid camera type: ${type}`);
    }
  }, [type, fov, aspect, near, far, width, height]);

  const bCameraProjectionMatrix = useTargetBindingView(
    targetId,
    "cameraProjectionMatrix",
    "mat4"
  );

  const bCameraViewMatrix = useTargetBindingView(
    targetId,
    "cameraViewMatrix",
    "mat4"
  );

  useEffect(() => {
    bCameraProjectionMatrix.update(projectionMatrix.elements);
  }, [projectionMatrix]);

  useEffect(() => {
    bCameraViewMatrix.update(transform.leafMatrix.clone().invert().elements);
  }, [transform.leafMatrix]);

  return null;
}
