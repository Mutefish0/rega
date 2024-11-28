import React, { useMemo, useState, useCallback, ReactNode } from "react";

import Relative from "../../primitives/Relative";
import { Node, MeasureMode } from "yoga-layout";
import YogaNode from "../YogaFlex/YogaNode";
import Box2D from "../Box2D";
import { TextStyle } from "./Text";
import ZIndex from "../../primitives/ZIndex";

interface BaseTextProps {
  children: string | number | Array<string | number>;
  style: TextStyle;
  ha: HA;
  verticalLayoutMethod: "top" | "bottom";
  renderItem: (code: number) => ReactNode;
}

interface TextLayout {
  lines: Array<{
    row: Array<{ code: number; xPos: number }>;
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

const NEWLINE = 10;

export function ceil(w: number) {
  let i = 0;
  for (; i < PRECISION; i++) {
    w *= 10;
    if (w % 1 === 0) {
      return Math.ceil(w) / Math.pow(10, i + 1);
    }
  }
  return Math.ceil(w) / Math.pow(10, i);
}

// horizontal advance
type HA = (code: number) => number;

function splitText(
  ha: HA,
  letterSpacing: number,
  codes: number[],
  maxWidth: number
): Array<{ width: number; row: Array<{ code: number; xPos: number }> }> {
  const result: Array<{
    width: number;
    row: Array<{ code: number; xPos: number }>;
  }> = [];

  let row: Array<{ code: number; xPos: number }> = [];

  let currentWidth = 0;
  let startIndex = 0;

  const charCount = codes.length;

  for (let i = 0; i < charCount; i++) {
    const charCode = codes[i];

    // 检查是否是换行符
    if (charCode === NEWLINE) {
      // '\n' 的 Unicode 编码是 10
      // 遇到换行符，强制结束当前行
      result.push({
        width: currentWidth,
        row,
      });

      startIndex = i + 1; // 新行从换行符后开始
      currentWidth = 0; // 重置宽度
      row = []; // 重置数据
      continue;
    }

    const _ha = ha(charCode);

    // 计算当前字符的宽度，只在不是第一字符时才考虑间距
    const charTotalWidth = _ha + (i > startIndex ? letterSpacing : 0);

    const nextWidth = currentWidth + charTotalWidth;

    if (nextWidth > maxWidth + ERROR && currentWidth > 0) {
      // 当前行超出宽度限制，分割

      result.push({
        width: currentWidth,
        row,
      });

      startIndex = i;
      currentWidth = _ha; // 新行开始，重置宽度
      row = [
        {
          xPos: 0,
          code: charCode,
        },
      ]; // 重置数据
    } else {
      row.push({ code: charCode, xPos: currentWidth });
      currentWidth = nextWidth; // 累加当前宽度
    }
  }

  // 添加最后一行
  if (startIndex < charCount) {
    result.push({
      width: currentWidth,
      row,
    });
  }

  return result;
}

export default function BaseText({
  children: _children,
  ha,
  style,
  renderItem,
  verticalLayoutMethod,
}: BaseTextProps) {
  const {
    fontSize,
    letterSpacing = 0,
    lineHeight = fontSize,
    backgroundColor,
    textAlign = "start",
    paddingLeft: _padLeft = 0,
    paddingRight: _padRight = 0,
  } = style;

  const paddingLeft = _padLeft as number;
  const paddingRight = _padRight as number;

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

  const codes = useMemo(
    () => (children ? children.split("").map((c) => c.charCodeAt(0)) : []),
    [children]
  );

  const yPos = useMemo(() => {
    const lineSpacing = (lineHeight - fontSize) / 2;
    return verticalLayoutMethod === "bottom" ? lineSpacing : -lineSpacing;
  }, [fontSize, lineHeight]);

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
      const lines = splitText(ha, letterSpacing, codes, viewLayout.width);
      const textLayout = {
        lines,
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
    const lines = splitText(ha, letterSpacing, codes, _width);

    let fullHeight = lineHeight * lines.length;
    const fullWidth =
      Math.max(...lines.map((l) => l.width)) + paddingLeft + paddingRight;

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

  const handleLayout = useCallback(_handleLayout, [codes, ha, letterSpacing]);

  const handleMeasure = useCallback(_handleMeasure, [
    codes,
    letterSpacing,
    ha,
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
        layout.textLayout.lines.map((line, i) => {
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
              <ZIndex zIndex={1}>
                {line.row.map((col, i) => (
                  <Relative
                    key={`${col.code}-${i}`}
                    translation={{
                      x: col.xPos + paddingLeft,
                      y: yPos,
                    }}
                  >
                    {renderItem(col.code)}
                  </Relative>
                ))}
              </ZIndex>
            </Relative>
          );
        })}
    </>
  );
}
