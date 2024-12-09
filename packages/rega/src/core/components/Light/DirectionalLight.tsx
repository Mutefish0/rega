import { useEffect, useContext } from "react";
import { RenderTargetContext } from "../../primitives/RenderTarget";
import useBindingViews from "../../hooks/useBindingViews";

interface Props {
  intensity: number;
  direction: [number, number, number];
}

const bindingsLayout = {
  directionalLight_direction: "vec3",
  directionalLight_intensity: "float",
} as const;

export default function DirectionalLight({ intensity, direction }: Props) {
  const renderTarget = useContext(RenderTargetContext);

  const bindingViews = useBindingViews(bindingsLayout, renderTarget.bindings);

  useEffect(() => {
    bindingViews.directionalLight_intensity([intensity]);
  }, [intensity]);

  useEffect(() => {
    bindingViews.directionalLight_direction(direction);
  }, [direction.join(",")]);

  return null;
}

DirectionalLight.bindingsLayout = bindingsLayout;
