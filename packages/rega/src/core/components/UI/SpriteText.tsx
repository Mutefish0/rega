import { useMemo, useState, useCallback } from "react";
import Sprite2D from "../Sprite2D";
import Relative from "../../primitives/Relative";
import BMPFont from "./BMPFont";
import { Node, MeasureMode } from "yoga-layout";
import YogaNode from "../YogaFlex/YogaNode";
import Box2D from "../Box2D";
import { FlexStyle } from "../YogaFlex/FlexStyle";

export interface TextStyle extends FlexStyle {
  fontSize: number;
  lineHeight?: number;
  color?: string;
  letterSpacing?: number;

  backgroundColor?: string;
}

export interface SpriteTextProps {
  font: BMPFont;
  children: string;
  style: TextStyle;
}

interface TextLayout {
  segments: Array<
    Array<{ clip: [number, number, number, number]; code: number }>
  >;
}
interface ViewLayout {
  width: number;
  height: number;
  left: number;
  top: number;
}

function splitText(
  charWidth: number,
  letterSpacing: number,
  charCount: number,
  maxWidth: number
): Array<[number, number]> {
  const result: Array<[number, number]> = [];
  let currentWidth = 0;
  let startIndex = 0;

  for (let i = 0; i < charCount; i++) {
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

export default function SpriteText({ children, font, style }: SpriteTextProps) {
  const {
    fontSize,
    letterSpacing = 0,
    color = "white",
    lineHeight = fontSize,
    backgroundColor,
  } = style;
  const [layout, setLayout] = useState<{
    textLayout: TextLayout;
    viewLayout: ViewLayout;
  }>();

  const clips = useMemo(() => {
    const codes = children
      ? children.split("").map((c) => c.charCodeAt(0))
      : [];

    const clips = codes
      .map((c, i) => ({ clip: font.getClip(c)!, code: codes[i] }))
      .filter((c) => !!c.clip);

    return clips;
  }, [children]);

  const charWidth = useMemo(
    () => fontSize * font.aspectRatio,
    [font.aspectRatio, fontSize]
  );

  const textStyle = useMemo(() => {
    return {
      flexShrink: 1,
      ...style,
    };
  }, [style, layout]);

  function _handleLayout(node: Node) {
    if (node.hasNewLayout()) {
      const viewLayout = node.getComputedLayout();
      const lines = splitText(
        charWidth,
        letterSpacing,
        clips.length,
        viewLayout.width
      );

      const textLayout = {
        segments: lines.map((line) => clips.slice(line[0], line[1])),
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
      clips.length * charWidth + (clips.length - 1) * letterSpacing;

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
        const lines = splitText(charWidth, letterSpacing, clips.length, _width);
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
    clips,
    charWidth,
    letterSpacing,
  ]);

  const handleMeasure = useCallback(_handleMeasure, [
    clips,
    charWidth,
    letterSpacing,
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
        layout.textLayout.segments.map((line, i) => (
          <Relative
            key={i}
            translation={{
              x: layout.viewLayout.left,
              y: -i * lineHeight - layout.viewLayout.top,
              z: 0,
            }}
          >
            {line.map((clip, j) => (
              <Relative
                key={`${clip.code}:${j}`}
                translation={{
                  x:
                    j * charWidth + (j === line.length ? 0 : j * letterSpacing),
                  y: 0,
                  z: 0,
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
            ))}
          </Relative>
        ))}
    </>
  );
}
