// Yoga layout system
import { FlexStyle, applyStyle, FlexStyleNames } from "./FlexStyle";
import Yoga, { Node, MeasureFunction, Direction, Config } from "yoga-layout";

import { traverseTreeBFS } from "../../tools/tree";

export type { MeasureFunction, FlexStyle, Node };

export interface YogaElement {
  isDirty: boolean;
  node: Node;
  parent: YogaElement | null;
  children: YogaElement[];
  onLayout?: (node: Node) => void;
}

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

function getID(el: YogaElement) {
  return (el.node as any)["M"]["O"] as number;
}

export class YogaSystem {
  public static markDirty(el: YogaElement) {
    el.isDirty = true;
  }

  public rootElement: YogaElement;

  constructor() {
    this.rootElement = YogaSystem.createElement();
  }

  public static createElement(config?: Config): YogaElement {
    const node = Yoga.Node.create(config);
    return {
      isDirty: false,
      parent: null,
      node,
      children: [],
    };
  }

  public static appendChild(parent: YogaElement, child: YogaElement) {
    console.debug(`Yoga Append: ${getID(child)} -> ${getID(parent)}`);
    parent.node.insertChild(child.node, parent.node.getChildCount());
  }

  public static insertBeforeIndex(
    parent: YogaElement,
    child: YogaElement,
    beforeIndex: number
  ) {
    console.debug(
      `Yoga Insert: ${getID(child)} -> ${getID(parent)} as ${beforeIndex}`
    );
    parent.node.insertChild(child.node, beforeIndex);
  }

  public static removeChild(
    parent: YogaElement | null,
    child: YogaElement,
    keeplive = false
  ) {
    if (parent) {
      console.debug(`Yoga Remove: ${getID(child)} -> ${getID(parent)}`);
      parent.node.removeChild(child.node);
    }
    if (!keeplive) {
      child.node.freeRecursive();
    }
  }

  public static applyStyle(el: YogaElement, style: FlexStyle) {
    applyStyle(el.node, style);
  }

  public static diffStyle(styleOld: FlexStyle, styleNew: FlexStyle) {
    const keys = new Set([...Object.keys(styleOld), ...Object.keys(styleNew)]);

    let hasDiff = false;

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
            hasDiff = true;
          }
        } else {
          // @ts-ignore
          diff[key] = styleNew[key];
          hasDiff = true;
        }
      }
    }

    return hasDiff ? diff : null;
  }

  public static setMeasureFunc(el: YogaElement, func?: MeasureFunction) {
    if (func) {
      el.node.setMeasureFunc(func);
    } else {
      el.node.unsetMeasureFunc();
    }
    el.node.markDirty();
  }

  public static validateAndCalculateLayout(el: YogaElement) {
    if (el.isDirty) {
      el.node.calculateLayout(undefined, undefined, Direction.LTR);
      traverseTreeBFS(el, (el) => {
        if (el.onLayout) {
          if (el.node.hasNewLayout()) {
            el.onLayout(el.node);
          }
        }
      });
      el.isDirty = false;
    }
  }
}

export interface YogaElementProps {
  style?: FlexStyle;
  onLayout?: (node: Node) => void;
  measureFunc?: MeasureFunction;
  config?: Config;
}
