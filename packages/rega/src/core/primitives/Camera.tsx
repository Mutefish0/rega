import React, { useContext, useEffect, useMemo } from "react";
import TransformContext from "./TransformContext";
import { BindingContext } from "./BindingLayer";
import { WebGPUCoordinateSystem } from "three/src/constants.js";
import { DEG2RAD } from "three/src/math/MathUtils.js";
import { AnchorType } from "../hooks/useAnchor";
import useBindingViews from "../hooks/useBindingViews";
import { Matrix4 } from "pure3";
import { createPipelineLayer } from "../render/pass";

interface CommonProps {}

interface PerspectiveProps {
  type: "perspective";
  fov?: number;
  aspect?: number;
  near?: number;
  far?: number;

  width?: never;
  height?: never;
  anchor?: never;
}

interface OrthographicProps {
  type: "orthographic";
  width: number;
  height: number;
  near?: number;
  far?: number;
  anchor?: AnchorType;

  fov?: never;
  aspect?: never;
}

type Props = (PerspectiveProps | OrthographicProps) & CommonProps;

const bindingsLayout = {
  cameraProjectionMatrix: "mat4",
  cameraViewMatrix: "mat4",
} as const;

export default function Camera({
  type,
  width,
  height,

  fov = 50,
  aspect = 1,
  near = 0.1,
  far = 2000,

  anchor = "center",
}: Props) {
  const transform = useContext(TransformContext);
  const bCtx = useContext(BindingContext);

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
      let left = 0,
        right = 0,
        top = 0,
        bottom = 0;

      const half = width / 2;
      const halfH = height / 2;

      if (anchor === "center") {
        left = -half;
        right = half;
        top = halfH;
        bottom = -halfH;
      } else if (anchor === "top-left") {
        left = 0;
        right = width;
        top = 0;
        bottom = -height;
      } else if (anchor === "top") {
        left = -half;
        right = half;
        top = 0;
        bottom = -height;
      } else if (anchor === "bottom") {
        left = -half;
        right = half;
        top = height;
        bottom = 0;
      } else if (anchor === "bottom-left") {
        left = 0;
        right = width;
        top = height;
        bottom = 0;
      }

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
  }, [type, fov, aspect, near, far, width, height, anchor]);

  const bindingViews = useBindingViews(bindingsLayout, bCtx);

  useEffect(() => {
    bindingViews.cameraProjectionMatrix(projectionMatrix.elements);
  }, [projectionMatrix]);

  useEffect(() => {
    bindingViews.cameraViewMatrix(
      transform.leafMatrix.clone().invert().elements
    );
  }, [transform.leafMatrix]);

  return null;
}

Camera.layer = createPipelineLayer(
  bindingsLayout,
  ({ cameraProjectionMatrix, cameraViewMatrix }) =>
    ({ position }) => ({
      position: cameraProjectionMatrix.mul(cameraViewMatrix).mul(position),
    })
);
