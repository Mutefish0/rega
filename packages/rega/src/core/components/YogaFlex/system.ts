// Yoga layout system
import { FlexStyle, applyStyle } from "./FlexStyle";
import Yoga, { Node, MeasureFunction, Direction, Config } from "yoga-layout";
import { diffStyle } from "./YogaNode";

import { traverseTreeBFS } from "../../tools/tree";

export type { MeasureFunction, FlexStyle };

export interface YogaElement {
  isDirty: boolean;
  node: Node;
  parent: YogaElement | null;
  children: YogaElement[];
  onLayout?: (node: Node) => void;
}

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

  public static diffStyle = diffStyle;

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
            console.log("Has NewLayout");
            el.onLayout(el.node);
          } else {
            console.log("No NewLayout");
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
