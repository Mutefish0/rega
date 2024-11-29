import React, { useMemo, useState, useCallback, ReactNode } from "react";

import Relative from "../../../primitives/Relative";
import { Node, MeasureMode } from "yoga-layout";
import YogaNode from "../../YogaFlex/YogaNode";
import Box2D from "../../Box2D";
import { TextStyle } from "./index";
import ZIndex from "../../../primitives/ZIndex";
import { HA, splitText, ceil } from "./utils";

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

export { ceil };

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
    return verticalLayoutMethod === "bottom"
      ? -lineHeight + lineSpacing
      : -lineSpacing;
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
      // inline style width is not supported
      width: undefined,
    };
  }, [style, layout]);

  function _handleLayout(node: Node) {
    if (node.hasNewLayout()) {
      const viewLayout = node.getComputedLayout();

      const lines = splitText(
        ha,
        letterSpacing,
        codes,
        viewLayout.width,
        paddingLeft,
        paddingRight
      );

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
    const lines = splitText(
      ha,
      letterSpacing,
      codes,
      _width,
      paddingLeft,
      paddingRight
    );

    let fullHeight = lineHeight * lines.length;

    const fullWidth = Math.max(...lines.map((l) => l.width));

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
    codes,
    ha,
    letterSpacing,
    paddingLeft,
    paddingRight,
  ]);

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
                    size={[line.width, lineHeight]}
                    color={backgroundColor}
                  />
                </ZIndex>
              )}
              <ZIndex zIndex={1}>
                {line.row.map((col, i) => (
                  <Relative
                    key={`${col.code}-${i}`}
                    translation={{
                      x: col.xPos,
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
