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
    console.log("yoga append:", child.node["M"]["O"], parent.node["M"]["O"]);

    parent.node.insertChild(child.node, parent.node.getChildCount());
  }

  public static insertBeforeChild(
    parent: YogaElement,
    child: YogaElement,
    beforeChild: YogaElement
  ) {
    //parent.node.removeChild(child.node);
    //const index = parent.children.findIndex((el) => el === beforeChild);
    //parent.node.insertChild(child.node, parent.node.getChildCount());
  }

  public static removeChild(parent: YogaElement | null, child: YogaElement) {
    if (parent) {
      console.log("yoga remove:", child.node, parent.node);

      parent.node.removeChild(child.node);
    }
    child.node.freeRecursive();
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
