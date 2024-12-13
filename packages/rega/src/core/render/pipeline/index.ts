import { vec4, normalize, max, dot, modelWorldMatrix } from "pure3";
import { PipelineIn, Pipeline } from "../pass";

export const BasicLightModel: Pipeline = ({
  color,
  lightDir,
  lightColor,
  normal,
}: //ambientColor,
PipelineIn) => {
  lightDir = normalize(lightDir);
  const normalWorld = modelWorldMatrix.mul(vec4(normal, 1)).xyz;
  const lambertDiffuse = lightColor.mul(
    max(dot(normalWorld, lightDir.negate()), 0.0)
  );
  return {
    color: color.mul(lambertDiffuse),
  };
};
export const PBRLightModel = () => ({});
