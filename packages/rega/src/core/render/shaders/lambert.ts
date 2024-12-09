import { Fn, Node, normalize, max, dot, varying } from "pure3";

import { worldNormalNode } from "./index";

export const lambertDiffuse = Fn(
  ({
    lightDir,
    lightIntensity,
  }: {
    lightDir: Node<"vec3">;
    lightIntensity: Node<"float">;
  }) => {
    lightDir = normalize(lightDir);
    return max(dot(varying(worldNormalNode), lightDir), 0.0).mul(
      lightIntensity
    );
  }
);
