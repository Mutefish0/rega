import { normalize, max, dot, add } from "pure3";
import { PipelineIn, Pipeline } from "../pass";

export const BasicLightModel: Pipeline = ({
  color,
  lightDir,
  lightColor,
  normal,
  ambientColor,
}: PipelineIn) => {
  lightDir = normalize(lightDir);
  const lambertDiffuse = lightColor.mul(
    max(dot(normal, lightDir.negate()), 0.0)
  );
  return {
    color: add(color.mul(lambertDiffuse), color.mul(ambientColor)),
  };
};

export const PBRLightModel = () => ({});
