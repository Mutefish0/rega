// Yoga layout system
import { FlexStyle, applyStyle } from "./FlexStyle";
import Yoga, { Node, MeasureFunction, Direction, Config } from "yoga-layout";
import { diffStyle } from "./YogaNode";

export type { MeasureFunction, FlexStyle };

export interface YogaElement {
  isDirty: boolean;
  type: "yoga_element";
  node: Node;
  parent: YogaElement | null;
  children: YogaElement[];
  onLayout?: (node: Node) => void;
}

export interface YogaFragment {
  type: "yoga_fragment";
  children: YogaElementNode[];
}

type YogaElementNode = YogaElement | YogaFragment;

function traverseTree(el: YogaElementNode, cb: (el: YogaElement) => void) {
  if (el.type === "yoga_element") {
    cb(el);
  }
  for (const child of el.children) {
    traverseTree(child, cb);
  }
}

function traverseFragmentTree(el: YogaFragment, cb: (el: YogaElement) => void) {
  for (const child of el.children) {
    if (child.type === "yoga_element") {
      cb(child);
    } else {
      traverseFragmentTree(child, cb);
    }
  }
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
      type: "yoga_element",
      node,
      children: [],
    };
  }

  public static createFragment(): YogaFragment {
    return {
      type: "yoga_fragment",
      children: [],
    };
  }

  public static appendChild(parent: YogaElement, child: YogaElement) {
    parent.node.insertChild(child.node, parent.node.getChildCount());
  }

  public static insertBeforeChild(
    parent: YogaElement,
    child: YogaElement,
    beforeChild: YogaElement
  ) {
    parent.node.removeChild(child.node);
    //const index = parent.children.findIndex((el) => el === beforeChild);
    parent.node.insertChild(child.node, parent.node.getChildCount());
  }

  public static appendChildFragment(parent: YogaElement, child: YogaFragment) {
    traverseFragmentTree(child, (el) => {
      parent.node.insertChild(el.node, parent.node.getChildCount());
    });
  }

  public static removeChild(parent: YogaElement, child: YogaElement) {
    parent.node.removeChild(child.node);
    child.node.freeRecursive();
  }

  public static removeChildFragment(parent: YogaElement, child: YogaFragment) {
    traverseFragmentTree(child, (el) => {
      parent.node.removeChild(el.node);
      el.node.freeRecursive();
    });
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

  public static checkAndCalculateLayout(el: YogaElement) {
    if (el.isDirty) {
      el.node.calculateLayout(undefined, undefined, Direction.LTR);
      traverseTree(el, (el) => {
        if (el.onLayout) {
          if (el.node.hasNewLayout()) {
            //
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

  // public checkAndCalculateLayout() {
  //   if (this.isDirty) {
  //     this.rootElement.node.calculateLayout(
  //       undefined,
  //       undefined,
  //       Direction.LTR
  //     );
  //     traverseTree(this.rootElement, (el) => {
  //       if (el.onLayout) {
  //         if (el.node.hasNewLayout()) {
  //           //
  //           console.log("Has NewLayout");
  //           el.onLayout(el.node);
  //         } else {
  //           console.log("No NewLayout");
  //         }
  //       }
  //     });
  //     this.isDirty = false;
  //   }
  // }
}

export interface YogaElementProps {
  style?: FlexStyle;
  onLayout?: (node: Node) => void;
  measureFunc?: MeasureFunction;
  config?: Config;
}
