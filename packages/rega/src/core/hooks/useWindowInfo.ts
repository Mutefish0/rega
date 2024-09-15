import { useMemo } from "react";
import ThreeContext from "../primitives/ThreeContext";
import { useContext } from "react";

export default function useWindowInfo() {
  const ctx = useContext(ThreeContext);

  const width = ctx.size[0];
  const height = ctx.size[1];
  const pixelRatio = ctx.pixelRatio;

  const clientWidth = useMemo(() => width / pixelRatio, [width, pixelRatio]);
  const clientHeight = useMemo(() => height / pixelRatio, [height, pixelRatio]);

  return {
    width,
    height,
    pixelRatio,
    clientWidth,
    clientHeight,
  };
}
