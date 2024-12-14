import { useEffect, useContext } from "react";
import useBindingViews from "../../hooks/useBindingViews";
import { PipelineOut, createPipelineLayer } from "../../render/pass";
import { Vector3 } from "pure3";
import { parseColor } from "../../tools/color";
import { BindingContext } from "../../primitives/BindingLayer";
import TransformContext from "../../primitives/TransformContext";

interface Props {
  intensity: number;
  direction: [number, number, number];
  color?: string;
}

const bindingsLayout = {
  directionalLight_color: "vec3",
  directionalLight_direction: "vec3",
  directionalLight_intensity: "float",
} as const;

export default function DirectionalLight({
  intensity,
  direction,
  color: colorValue = "#fff",
}: Props) {
  const bCtx = useContext(BindingContext);
  const bindingViews = useBindingViews(bindingsLayout, bCtx);
  const transform = useContext(TransformContext);

  useEffect(() => {
    bindingViews.directionalLight_intensity([intensity]);
  }, [intensity]);

  useEffect(() => {
    const v = new Vector3(direction[0], direction[1], direction[2]);
    v.applyMatrix4(transform.leafMatrix);
    bindingViews.directionalLight_direction([v.x, v.y, v.z]);
  }, [direction.join(","), transform.leafMatrix]);

  useEffect(() => {
    const { opacity, array } = parseColor(colorValue || "#fff");
    bindingViews.directionalLight_color(array.map((v) => v * opacity));
  }, [colorValue]);

  return null;
}

DirectionalLight.layer = createPipelineLayer(
  bindingsLayout,
  ({
      directionalLight_color,
      directionalLight_intensity,
      directionalLight_direction,
    }) =>
    () => {
      return {
        lightColor: directionalLight_color.mul(directionalLight_intensity),
        lightDir: directionalLight_direction,
      };
    }
);
