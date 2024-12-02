import React, {
  useMemo,
  useState,
  useCallback,
  ReactNode,
  ReactElement,
} from "react";

import Relative from "../../../primitives/Relative";
import { Node, MeasureMode } from "yoga-layout";
import YogaNode from "../../YogaFlex/YogaNode";
import Box2D from "../../Box2D";
import { TextStyle } from "./index";
import ZIndex from "../../../primitives/ZIndex";
import { HA, splitText, ceil } from "./utils";
import Br from "./Br";

interface BaseTextProps {
  children: TextChildren;
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

export type TextChildren =
  | string
  | number
  | Array<string | number | ReactElement<void, typeof Br>>;

function processChildren(_children: TextChildren) {
  const children = Array.isArray(_children) ? _children : [_children];
  const strArr = children.map((child) => {
    if (typeof child === "object") {
      if (child.type === Br) {
        return "\n";
      }
      return "";
    } else {
      return child;
    }
  });
  return strArr.join("");
}

export default function BaseText({
  children: _children,
  ha,
  style,
  renderItem,
  verticalLayoutMethod,
}: BaseTextProps) {
  const {
    letterSpacing = 0,
    fontSize,
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

  const children = useMemo(() => processChildren(_children), [_children]);

  const codes = useMemo(
    () => (children ? children.split("").map((c) => c.charCodeAt(0)) : []),
    [children]
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
                      //y: yPos,
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
