import { useContext, useMemo, useEffect, useRef } from "react";
import Yoga, { MeasureFunction, Direction, Node } from "yoga-layout";
import YogaContext from "./YogaContext";
import YogaConfigContext from "./YogaConfigContext";

import { applyStyle, FlexStyle, FlexStyleNames } from "./FlexStyle";

export type { Node };

const DEFAULT_STYLE: FlexStyle = {
  alignContent: "flex-start",
  alignItems: "flex-start",
  alignSelf: "auto",
  direction: "inherit",
  display: "none",
  flexBasis: "auto",
  flexDirection: "column",
  flexGrow: 0,
  flexShrink: 0,
  flexWrap: "nowrap",
  height: "auto",
  justifyContent: "flex-start",
  maxHeight: undefined,
  maxWidth: undefined,
  minHeight: undefined,
  minWidth: undefined,
  overflow: "visible",
  width: undefined,
  margin: 0,
  marginLeft: 0,
  marginRight: 0,
  marginTop: 0,
  marginBottom: 0,
  padding: 0,
  paddingLeft: 0,
  paddingRight: 0,
  paddingTop: 0,
  paddingBottom: 0,
  borderWidth: 0,
  borderLeftWidth: 0,
  borderRightWidth: 0,
  borderTopWidth: 0,
  borderBottomWidth: 0,
};

function diffStyle(styleOld: FlexStyle, styleNew: FlexStyle) {
  const keys = new Set([...Object.keys(styleOld), ...Object.keys(styleNew)]);

  const diff: FlexStyle = {};

  for (const key of keys) {
    if (!FlexStyleNames.includes(key)) {
      continue;
    }
    // @ts-ignore
    if (styleOld[key] !== styleNew[key]) {
      // @ts-ignore
      if (typeof styleNew[key] === "undefined") {
        // @ts-ignore
        if (styleOld[key] !== DEFAULT_STYLE[key]) {
          // @ts-ignore
          diff[key] = DEFAULT_STYLE[key];
        }
      } else {
        // @ts-ignore
        diff[key] = styleNew[key];
      }
    }
  }

  return diff;
}

interface Props {
  children?: React.ReactNode;
  measureFunc?: MeasureFunction;
  onLayout?: (node: Node) => void;
  style?: FlexStyle;
}

export default function YogaNode({
  children = null,
  measureFunc,
  style = {},
  onLayout,
}: Props) {
  const ref = useRef({ tmo: 0 as any, style: {}, freed: false });

  const configCtx = useContext(YogaConfigContext);

  const parentCtx = useContext(YogaContext);

  const node = useMemo(() => Yoga.Node.create(configCtx.config), []);

  const layoutCallbacks = useMemo(() => new Set<() => void>(), []);

  const ctx = useMemo(
    () => ({
      node,
      drive: parentCtx
        ? parentCtx.drive
        : () => {
            clearTimeout(ref.current.tmo);
            ref.current.tmo = setTimeout(() => {
              if (!ref.current.freed) {
                node.calculateLayout(undefined, undefined, Direction.LTR);
                layoutCallbacks.forEach((cb) => cb());
              }
            }, 0);
          },
      layoutCallbacks: parentCtx ? parentCtx.layoutCallbacks : layoutCallbacks,
    }),
    []
  );

  useEffect(() => {
    if (measureFunc) {
      node.setMeasureFunc(measureFunc);
      node.markDirty();
      ctx.drive();
    } else {
      node.unsetMeasureFunc();
    }
  }, [measureFunc]);

  useEffect(() => {
    if (onLayout) {
      const cb = () => {
        onLayout(node);
      };
      ctx.layoutCallbacks.add(cb);
      //node.markDirty();
      ctx.drive();
      return () => {
        ctx.layoutCallbacks.delete(cb);
      };
    }
  }, [onLayout]);

  useEffect(() => {
    const diff = diffStyle(ref.current.style, style);
    if (Object.keys(diff).length > 0) {
      applyStyle(node, diff);
      ctx.drive();
      ref.current.style = style;
    }
  }, [style]);

  useEffect(() => {
    if (parentCtx) {
      parentCtx.node.insertChild(node, parentCtx.node.getChildCount());
      ctx.drive();
    }
    return () => {
      if (parentCtx) {
        parentCtx.node.removeChild(node);
        ctx.drive();
      }
      ref.current.freed = true;
      node.free();
    };
  }, []);

  return <YogaContext.Provider value={ctx}>{children}</YogaContext.Provider>;
}
