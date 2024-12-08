import { useEffect } from "react";
import useBindings from "../../hooks/useBingdings";

interface Props {
  intensity: number;
  direction: [number, number, number];
}

export default function useDirectionalLight({ intensity, direction }: Props) {
  const bindings = useBindings({
    directionalLight_direction: "vec3",
    directionalLight_intensity: "float",
  });

  useEffect(() => {
    bindings.updates.directionalLight_intensity([intensity]);
  }, [intensity]);

  useEffect(() => {
    bindings.updates.directionalLight_direction(direction);
  }, [direction]);

  return bindings.resources;
}
