// Yoga layout system
import { FlexStyle, applyStyle } from "./FlexStyle";
import Yoga, { Node, MeasureFunction, Direction } from "yoga-layout";
import { diffStyle } from "./YogaNode";

export type { MeasureFunction, FlexStyle };

export interface YogaElement {
  type: "yoga_element";
  node: Node;
  children: YogaElementNode[];
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

// function appendYogaChild(parent: YogaElement, child: YogaElementNode) {
//   if (child.type === "yoga_element") {
//     parent.node.insertChild(child.node, parent.node.getChildCount());
//   } else if (child.type === "yoga_fragment") {
//     for (const c of child.children) {
//       appendYogaChild(parent, c);
//     }
//   }
// }

function freeYogaSubtree(root: YogaElementNode) {
  if (root.type === "yoga_element") {
    root.node.freeRecursive();
  } else if (root.type === "yoga_fragment") {
    for (const c of root.children) {
      freeYogaSubtree(c);
    }
  }
}

export class YogaSystem {
  public isDirty = false;

  public markDirty() {
    this.isDirty = true;
  }

  public rootElement: YogaElement;

  constructor() {
    this.rootElement = YogaSystem.createElement();
  }

  public static createElement(): YogaElement {
    const node = Yoga.Node.create();
    return {
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
    parent.children.push(child);
    parent.node.insertChild(child.node, parent.node.getChildCount());
  }

  public static appendChildFragment(parent: YogaElement, child: YogaFragment) {
    parent.children.push(child);
    traverseFragmentTree(child, (el) => {
      parent.node.insertChild(el.node, parent.node.getChildCount());
    });
  }

  public static removeChild(parent: YogaElementNode, child: YogaElementNode) {
    const index = parent.children.findIndex((el) => el === child);
    if (index > -1) {
      parent.children.splice(index, 1);
      freeYogaSubtree(child);
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

  public checkAndCalculateLayout() {
    if (this.isDirty) {
      this.rootElement.node.calculateLayout(
        undefined,
        undefined,
        Direction.LTR
      );
      traverseTree(this.rootElement, (el) => {
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
      this.isDirty = false;
    }
  }
}

export interface YogaElementProps {
  style?: FlexStyle;
  onLayout?: (node: Node) => void;
  measureFunc?: MeasureFunction;
}
