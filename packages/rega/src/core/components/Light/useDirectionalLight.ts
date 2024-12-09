import { useEffect } from "react";
import useBindings, { BindingsLayout } from "../../hooks/useBingdings";

interface Props {
  intensity: number;
  direction: [number, number, number];
}

const bindingsLayout: BindingsLayout = {
  directionalLight_direction: "vec3",
  directionalLight_intensity: "float",
};

export default function DirectionalLight({ intensity, direction }: Props) {
  const bindings = useBindings(bindingsLayout);

  useEffect(() => {
    bindings.updates.directionalLight_intensity([intensity]);
  }, [intensity]);

  useEffect(() => {
    bindings.updates.directionalLight_direction(direction);
  }, [direction.join(",")]);
}

DirectionalLight.bindingsLayout = bindingsLayout;
