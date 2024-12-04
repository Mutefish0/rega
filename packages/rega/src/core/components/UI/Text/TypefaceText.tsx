import { useMemo, useCallback, useEffect, useContext } from "react";
import BlockContext from "../BlockContext";
import Relative from "../../../primitives/Relative";
import {
  uniform,
  Matrix4,
  cameraProjectionMatrix,
  cameraViewMatrix,
  modelWorldMatrix,
  positionGeometry,
  vec4,
} from "pure3";

import BaseText, { TextChildren } from "./BaseText";
import { TextStyle } from "./index";
import TFFont from "../../../font/TFFont";
import { parseColor } from "../../../tools/color";
import RenderObject from "../../../primitives/RenderObject";
import useBindings from "../../../hooks/useBingdings";

interface TextProps {
  font: TFFont;
  children: TextChildren;
  style: TextStyle;
}

const color = uniform("vec3", "color");
const opacity = uniform("float", "opacity");

const vertexNode = cameraProjectionMatrix
  .mul(cameraViewMatrix)
  .mul(modelWorldMatrix)
  .mul(vec4(positionGeometry, 1));

const fragmentNode = vec4(color, opacity);

export default function TypefaceText({ children, font, style }: TextProps) {
  const { fontSize, color = "white" } = style;

  const blockContext = useContext(BlockContext);

  const { scale, scaleMatrix } = useMemo(() => {
    const scale = fontSize / font.fontSize;
    return {
      scale,
      scaleMatrix: new Matrix4().makeScale(scale, scale, scale),
    };
  }, [font, fontSize]);

  const lineHeight = font.lineHeight * scale;

  let lineSpacing = 0;

  if (style.lineHeight) {
    lineSpacing = (style.lineHeight - lineHeight) / 2;
  }

  const mergedStyle = useMemo(
    () => ({ lineHeight, ...style }),
    [style, lineHeight]
  );

  const yOffset = useMemo(() => font.ascender * scale, [scale, font.ascender]);

  const bindings = useBindings({
    opacity: "float",
    color: "vec3",
  });

  useEffect(() => {
    const { opacity, array } = parseColor(color || "#fff");
    bindings.updates.opacity([opacity * blockContext.opacity]);
    bindings.updates.color(array);
  }, [color, blockContext.opacity]);

  const ha = useCallback(
    (code: number) => {
      const glyph = font.getGlyph(code);
      return glyph ? glyph.ha * scale : 0;
    },
    [font, scale]
  );

  return (
    <BaseText
      ha={ha}
      style={mergedStyle}
      renderItem={(code) => {
        const { vertex, vertexCount } = font.getGeometry(code);

        return (
          <Relative
            translation={{
              y: -yOffset - lineSpacing,
            }}
          >
            <Relative matrix={scaleMatrix}>
              <RenderObject
                bindings={bindings.resources}
                vertexNode={vertexNode}
                fragmentNode={fragmentNode}
                vertex={vertex}
                vertexCount={vertexCount}
                zIndexEnabled
              />
            </Relative>
          </Relative>
        );
      }}
    >
      {children}
    </BaseText>
  );
}
