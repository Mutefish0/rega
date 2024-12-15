import { useContext, useEffect } from "react";
import useBindingViews from "../../hooks/useBindingViews";
import { BindingContext } from "../../primitives/BindingLayer";
import { parseColor } from "../../tools/color";
import { createPipelineLayer } from "../../render/pass";

const bindingsLayout = {
  ambientLight_color: "vec3",
} as const;

interface Props {
  intensity: number;
  color?: string;
}

export default function AmbientLight({
  intensity,
  color: colorValue = "#fff",
}: Props) {
  const bCtx = useContext(BindingContext);
  const bindingViews = useBindingViews(bindingsLayout, bCtx.resources);

  useEffect(() => {
    const { opacity, array } = parseColor(colorValue || "#fff");
    bindingViews.ambientLight_color(array.map((v) => v * opacity * intensity));
  }, [colorValue, intensity]);

  return null;
}

AmbientLight.layer = createPipelineLayer(
  bindingsLayout,
  ({ ambientLight_color }) =>
    () => ({ ambientColor: ambientLight_color })
);
