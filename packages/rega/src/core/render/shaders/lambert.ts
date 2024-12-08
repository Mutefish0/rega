import {
  normalGeometry,
  Fn,
  Node,
  normalize,
  max,
  dot,
  varying,
  float,
} from "pure3";

export const lambertDiffuse = Fn(
  ({
    lightDir,
    lightIntensity,
  }: {
    lightDir: Node<"vec3">;
    lightIntensity: Node<"float">;
  }) => {
    lightDir = normalize(lightDir);

    return max(dot(varying(normalGeometry), lightDir), 0.0).mul(lightIntensity);

    //return float(1);
  }
);
