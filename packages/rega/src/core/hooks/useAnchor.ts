import { useMemo } from "react";
import { Matrix4, Vector3 } from "three/webgpu";

export type AnchorType =
  | "bottom"
  | "top"
  | "bottom-left"
  | "top-left"
  | "center";

export default function useAnchor(
  anchor: AnchorType,
  size: [number, number] | [number, number, number]
): Matrix4 {
  const matrix = useMemo(() => {
    if (size[0] === 0 && size[1] === 0) {
      return new Matrix4();
    }
    let translation = [0, 0];
    if (anchor === "bottom") {
      translation = [0, size[1] / 2, 0];
    } else if (anchor === "top") {
      translation = [0, -size[1] / 2, 0];
    } else if (anchor === "bottom-left") {
      translation = [size[0] / 2, size[1] / 2, 0];
    } else if (anchor === "top-left") {
      translation = [size[0] / 2, -size[1] / 2, 0];
    }
    return new Matrix4().makeTranslation(new Vector3(...translation, 0));
  }, [anchor, size.join(",")]);

  return matrix;
}
