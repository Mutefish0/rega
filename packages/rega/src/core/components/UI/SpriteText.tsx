import { useMemo, useState, useCallback, useContext } from "react";
import Sprite2D from "../Sprite2D";
import Relative from "../../primitives/Relative";
import { Node, MeasureMode } from "yoga-layout";
import YogaNode from "../YogaFlex/YogaNode";
import Box2D from "../Box2D";
import { TextStyle } from "./Text";
import BMPFont from "../../font/BMPFont";
import ZIndex from "../../primitives/ZIndex";
import BlockContext from "./BlockContext";

interface SpriteTextProps {
  font: BMPFont;
  children: string | number | Array<string | number>;
  style: TextStyle;
}

interface TextLayout {
  segments: Array<{
    clips: Array<{ clip: [number, number, number, number]; code: number }>;
    width: number;
  }>;
}
interface ViewLayout {
  width: number;
  height: number;
  left: number;
  top: number;
}

const PRECISION = 6;
const ERROR = 1 / Math.pow(10, PRECISION);

function ceil(w: number) {
  let i = 0;
  for (; i < PRECISION; i++) {
    w *= 10;
    if (w % 1 === 0) {
      return Math.ceil(w) / Math.pow(10, i + 1);
    }
  }
  return Math.ceil(w) / Math.pow(10, i);
}

function splitText(
  charWidth: number,
  letterSpacing: number,
  codes: number[],
  maxWidth: number
): Array<[number, number, number]> {
  const result: Array<[number, number, number]> = [];
  let currentWidth = 0;
  let startIndex = 0;
  const charCount = codes.length;

  for (let i = 0; i < charCount; i++) {
    const charCode = codes[i];

    // 检查是否是换行符
    if (charCode === 10) {
      // '\n' 的 Unicode 编码是 10
      // 遇到换行符，强制结束当前行
      result.push([startIndex, i, currentWidth]);
      startIndex = i + 1; // 新行从换行符后开始
      currentWidth = 0; // 重置宽度
      continue;
    }

    // 计算当前字符的宽度，只在不是第一字符时才考虑间距
    const charTotalWidth = charWidth + (i > startIndex ? letterSpacing : 0);

    if (currentWidth + charTotalWidth > maxWidth + ERROR && currentWidth > 0) {
      // 当前行超出宽度限制，分割
      result.push([startIndex, i, currentWidth]);
      startIndex = i;
      currentWidth = charWidth; // 新行开始，重置宽度
    } else {
      currentWidth += charTotalWidth; // 累加当前宽度
    }
  }

  // 添加最后一行
  if (startIndex < charCount) {
    result.push([startIndex, charCount, currentWidth]);
  }

  return result;
}

export default function SpriteText({
  children: _children,
  font,
  style,
}: SpriteTextProps) {
  const {
    fontSize,
    letterSpacing = 0,
    color = "white",
    lineHeight = fontSize,
    backgroundColor,
    textAlign = "start",
    paddingLeft: _padLeft = 0,
    paddingRight: _padRight = 0,
  } = style;

  const paddingLeft = _padLeft as number;
  const paddingRight = _padRight as number;

  const blockContext = useContext(BlockContext);

  const [layout, setLayout] = useState<{
    textLayout: TextLayout;
    viewLayout: ViewLayout;
  }>();

  const children = useMemo(() => {
    if (Array.isArray(_children)) {
      return _children.join("");
    } else {
      return _children + "";
    }
  }, [_children]);

  const clips = useMemo(() => {
    const codes = children
      ? children.split("").map((c) => c.charCodeAt(0))
      : [];

    const clips = codes
      .map((c, i) => ({ clip: font.getClip(c), code: codes[i] }))
      .filter((c) => !!c.clip);

    return clips;
  }, [children]);

  const charWidth = useMemo(() => {
    let w = fontSize * font.aspectRatio;
    return ceil(w);
  }, [font.aspectRatio, fontSize]);

  const lineOffset = useMemo(
    () => (lineHeight - fontSize) / 2,
    [fontSize, lineHeight]
  );

  const textStyle = useMemo(() => {
    return {
      flexShrink: 1,
      ...style,
      // inline style, vertical padding is not supported
      paddingTop: 0,
      paddingBottom: 0,
      // horizontal padding is simplified
      paddingLeft: 0,
      paddingRight: 0,
    };
  }, [style, layout]);

  function _handleLayout(node: Node) {
    if (node.hasNewLayout()) {
      const viewLayout = node.getComputedLayout();

      const lines = splitText(
        charWidth,
        letterSpacing,
        clips.map((c) => c.code),
        viewLayout.width
      );

      const textLayout = {
        segments: lines.map((line) => ({
          clips: clips.slice(line[0], line[1]),
          width: line[2],
        })),
      };

      setLayout({
        textLayout,
        viewLayout,
      });
    }
  }

  function _handleMeasure(
    _width: number,
    widthMode: MeasureMode,
    _height: number,
    heightMode: MeasureMode
  ) {
    const lines = splitText(
      charWidth,
      letterSpacing,
      clips.map((c) => c.code),
      _width
    );

    let fullHeight = lineHeight * lines.length;
    const fullWidth =
      Math.max(...lines.map((l) => l[2])) + paddingLeft + paddingRight;

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

    return { height: ceil(height), width: ceil(width) };
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
    lineHeight,
    paddingLeft,
    paddingRight,
  ]);

  return (
    <>
      <YogaNode
        style={textStyle}
        onLayout={handleLayout}
        measureFunc={handleMeasure}
      />
      {!!layout &&
        layout.textLayout.segments.map((line, i) => {
          const baseX =
            textAlign === "end"
              ? layout.viewLayout.left + layout.viewLayout.width - line.width
              : textAlign === "center"
              ? layout.viewLayout.left +
                (layout.viewLayout.width - line.width) / 2
              : layout.viewLayout.left;

          return (
            <Relative
              key={i}
              translation={{
                x: baseX,
                y: -i * lineHeight - layout.viewLayout.top,
              }}
            >
              {!!backgroundColor && (
                <ZIndex zIndex={0}>
                  <Box2D
                    anchor="top-left"
                    size={[line.width + paddingLeft + paddingRight, lineHeight]}
                    color={backgroundColor}
                  />
                </ZIndex>
              )}
              {line.clips.map((clip, j) => (
                <Relative
                  key={`${clip.code}:${i}:${j}`}
                  translation={{
                    x:
                      j * charWidth +
                      paddingLeft +
                      (j === line.clips.length ? 0 : j * letterSpacing),
                    y: -lineOffset,
                  }}
                >
                  <ZIndex zIndex={1}>
                    <Sprite2D
                      anchor="top-left"
                      textureId={font.textureId}
                      clip={clip.clip}
                      size={[charWidth, fontSize]}
                      padding={0.1}
                      color={color}
                      alphaTextureId={font.textureId}
                      opacity={blockContext.opacity}
                    />
                  </ZIndex>
                </Relative>
              ))}
            </Relative>
          );
        })}
    </>
  );
}
