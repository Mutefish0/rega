import { useMemo, useState, useCallback, useEffect } from "react";
import Relative from "../../primitives/Relative";
import {
  uniform,
  Matrix4,
  cameraProjectionMatrix,
  cameraViewMatrix,
  modelWorldMatrix,
  positionGeometry,
  vec4,
} from "pure3";
import { Node, MeasureMode } from "yoga-layout";
import YogaNode from "../YogaFlex/YogaNode";
import Box2D from "../Box2D";
import { TextStyle } from "./Text";
import TFFont, { GlyphData } from "../../font/TFFont";
import { parseColor } from "../../tools/color";
import RenderObject from "../../primitives/RenderObject";
import useBindings from "../../hooks/useBingdings";

interface TextProps {
  font: TFFont;
  children: string | number | Array<string | number>;
  style: TextStyle;
}

interface TextLayout {
  segments: Array<Array<{ char: string; glyph: GlyphData }>>;
}
interface ViewLayout {
  width: number;
  height: number;
  left: number;
  top: number;
}

const color = uniform("vec3", "color");
const opacity = uniform("float", "opacity");

const vertexNode = cameraProjectionMatrix
  .mul(cameraViewMatrix)
  .mul(modelWorldMatrix)
  .mul(vec4(positionGeometry, 1));

const fragmentNode = vec4(color, opacity);

function splitText(
  glyphs: Array<{ ha: number }>,
  letterSpacing: number,
  scale: number,
  maxWidth: number
): Array<[number, number]> {
  const result: Array<[number, number]> = [];
  const charCount = glyphs.length;
  let currentWidth = 0;
  let startIndex = 0;

  for (let i = 0; i < charCount; i++) {
    const charWidth = glyphs[i].ha * scale;
    // 计算当前字符的宽度，只在不是第一字符时才考虑间距
    const charTotalWidth = charWidth + (i > startIndex ? letterSpacing : 0);

    if (currentWidth + charTotalWidth > maxWidth && currentWidth > 0) {
      result.push([startIndex, i]);
      startIndex = i;
      currentWidth = charWidth; // 新行开始，重置宽度
    } else {
      currentWidth += charTotalWidth;
    }
  }

  // Add the last line if there are remaining characters
  if (startIndex < charCount) {
    result.push([startIndex, charCount]);
  }

  return result;
}

export default function TypefaceText({
  children: _children,
  font,
  style,
}: TextProps) {
  const children = useMemo(() => {
    if (Array.isArray(_children)) {
      return _children.join("");
    } else {
      return _children + "";
    }
  }, [_children]);

  const {
    fontSize,
    letterSpacing = 0,
    color = "white",
    lineHeight = fontSize,
    backgroundColor,
  } = style;

  const lineSpacing = (lineHeight - fontSize) / 2;

  const { scale, scaleMatrix } = useMemo(() => {
    const scale = fontSize / font.fontSize;
    return {
      scale,
      scaleMatrix: new Matrix4().makeScale(scale, scale, scale),
    };
  }, [font, fontSize]);

  const bindings = useBindings({
    opacity: "float",
    color: "vec3",
  });

  useEffect(() => {
    const { opacity, array } = parseColor(color || "#fff");
    bindings.updates.opacity([opacity]);
    bindings.updates.color(array);
  }, [color, opacity]);

  const [layout, setLayout] = useState<{
    textLayout: TextLayout;
    viewLayout: ViewLayout;
  }>();

  const textStyle = useMemo(() => {
    return {
      flexShrink: 1,
      ...style,
    };
  }, [style, layout]);

  const { glyphs, chars } = useMemo(() => {
    const chars = children.split("").filter((char) => font.getGlyph(char));
    const glyphs = chars.map((char) => font.getGlyph(char)!);
    return {
      chars,
      glyphs,
    };
  }, [children, font]);

  function _handleLayout(node: Node) {
    if (node.hasNewLayout()) {
      const viewLayout = node.getComputedLayout();
      const lines = splitText(glyphs, letterSpacing, scale, viewLayout.width);

      const textLayout = {
        segments: lines.map((line) => {
          const ret = [];
          for (let i = line[0]; i < line[1]; i++) {
            ret.push({ char: chars[i], glyph: glyphs[i] });
          }
          return ret;
        }),
      };

      setLayout({ textLayout, viewLayout });
    }
  }

  function _handleMeasure(
    _width: number,
    widthMode: MeasureMode,
    _height: number,
    heightMode: MeasureMode
  ) {
    let fullHeight = lineHeight;
    const fullWidth =
      glyphs.reduce((prev, curr) => prev + curr.ha * scale, 0) +
      (glyphs.length - 1) * letterSpacing;

    let height = fullHeight;
    let width = fullWidth;

    if (widthMode === MeasureMode.Exactly || widthMode === MeasureMode.AtMost) {
      if (fullWidth <= _width) {
        if (widthMode === MeasureMode.AtMost) {
          width = fullWidth;
        } else {
          width = _width;
        }
      } else {
        const lines = splitText(glyphs, letterSpacing, scale, _width);
        width = _width;
        fullHeight = lines.length * lineHeight;
        height = fullHeight;
        if (heightMode === MeasureMode.Exactly) {
          height = _height;
        } else if (heightMode === MeasureMode.AtMost) {
          height = Math.min(_height, fullHeight);
        } else {
          height = fullHeight;
        }
      }
    } else if (widthMode === MeasureMode.Undefined) {
      width = fullWidth;
    }

    return { height, width };
  }

  const handleLayout = useCallback(_handleLayout, [
    glyphs,
    letterSpacing,
    scale,
  ]);

  const handleMeasure = useCallback(_handleMeasure, [
    glyphs,
    letterSpacing,
    lineHeight,
    scale,
  ]);

  return (
    <>
      <YogaNode
        style={textStyle}
        onLayout={handleLayout}
        measureFunc={handleMeasure}
      />
      {!!layout && !!backgroundColor && (
        <Relative
          translation={{ x: layout.viewLayout.left, y: -layout.viewLayout.top }}
        >
          <Box2D
            anchor="top-left"
            size={[layout.viewLayout.width, layout.viewLayout.height]}
            color={backgroundColor}
          />
        </Relative>
      )}
      {!!layout &&
        layout.textLayout.segments.map((line, i) => {
          let offsetX = 0;

          return (
            <Relative
              key={i}
              translation={{
                x: layout.viewLayout.left,
                y:
                  -(i + 1) * lineHeight -
                  layout.viewLayout.top -
                  font.descender * scale +
                  lineSpacing,
                z: 0,
              }}
            >
              {line.map((item, j) => {
                let x = offsetX;
                offsetX += item.glyph.ha * scale + letterSpacing;
                const { vertex, vertexCount } = font.getGeometry(item.char);

                return (
                  <Relative
                    key={`${item.glyph.o}:${i}:${j}`}
                    translation={{
                      x,
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
              })}
            </Relative>
          );
        })}
    </>
  );
}
