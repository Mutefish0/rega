import { useMemo, useState, useCallback } from "react";
import Relative from "../../primitives/Relative";
import { Node, MeasureMode } from "yoga-layout";
import YogaNode from "../YogaFlex/YogaNode";
import Box2D from "../Box2D";
import { TextStyle } from "./Text";
import TFFont, { GlyphData } from "../../font/TFFont";

interface TextProps {
  font: TFFont;
  children: string;
  style: TextStyle;
}

interface TextLayout {
  segments: Array<Array<GlyphData>>;
}
interface ViewLayout {
  width: number;
  height: number;
  left: number;
  top: number;
}

function splitText(
  glyphs: Array<{ ha: number }>,
  letterSpacing: number,
  maxWidth: number
): Array<[number, number]> {
  const result: Array<[number, number]> = [];
  const charCount = glyphs.length;
  let currentWidth = 0;
  let startIndex = 0;

  for (let i = 0; i < charCount; i++) {
    const charWidth = glyphs[i].ha;
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

export default function TypefaceText({ children, font, style }: TextProps) {
  const {
    fontSize,
    letterSpacing = 0,
    color = "white",
    lineHeight = fontSize,
    backgroundColor,
  } = style;

  const scale = useMemo(() => fontSize / font.fontSize, [font]);

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
      const lines = splitText(glyphs, letterSpacing, viewLayout.width);

      const textLayout = {
        segments: lines.map((line) => glyphs.slice(line[0], line[1])),
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
      glyphs.reduce((prev, curr) => prev + curr.ha, 0) +
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
        const lines = splitText(glyphs, letterSpacing, _width);
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

  const handleLayout = useCallback(_handleLayout, [glyphs, letterSpacing]);

  const handleMeasure = useCallback(_handleMeasure, [
    glyphs,
    letterSpacing,
    lineHeight,
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
                y: -i * lineHeight - layout.viewLayout.top,
                z: 0,
              }}
            >
              {line.map((glyph, j) => {
                let x = offsetX;
                offsetX += glyph.ha + letterSpacing;

                return (
                  <Relative
                    key={`${glyph.o}:${i}:${j}`}
                    translation={{
                      x,
                    }}
                  >
                    <Sprite2D
                      anchor="top-left"
                      textureId={font.textureId}
                      clip={clip.clip}
                      size={[charWidth, fontSize]}
                      padding={0.1}
                      color={color}
                      alphaTextureId={font.textureId}
                    />
                  </Relative>
                );
              })}
            </Relative>
          );
        })}
    </>
  );
}
