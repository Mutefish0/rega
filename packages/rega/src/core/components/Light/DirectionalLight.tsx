import { useEffect, useContext } from "react";
import useBindingViews from "../../hooks/useBindingViews";
import { PipelineOut } from "../../render/pass";
import { uniform, Vector3 } from "pure3";
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
const uniforms = {
  directionalLight_color: uniform("vec3", "directionalLight_color"),
  directionalLight_direction: uniform("vec3", "directionalLight_direction"),
  directionalLight_intensity: uniform("float", "directionalLight_intensity"),
};

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
    console.log("=== direction", direction);

    const v = new Vector3(direction[0], direction[1], direction[2]);

    v.applyMatrix4(transform.leafMatrix);

    const arr = [v.x, v.y, v.z];

    console.log("=== arr", arr);

    bindingViews.directionalLight_direction(arr);
  }, [direction.join(","), transform.leafMatrix]);

  useEffect(() => {
    const { opacity, array } = parseColor(colorValue || "#fff");
    bindingViews.directionalLight_color(array.map((v) => v * opacity));
  }, [colorValue]);

  return null;
}

DirectionalLight.bindingsLayout = bindingsLayout;
DirectionalLight.pipeline = () => {
  return {
    lightColor: uniforms.directionalLight_color.mul(
      uniforms.directionalLight_intensity
    ),
    lightDir: uniforms.directionalLight_direction,
  } as PipelineOut;
};
