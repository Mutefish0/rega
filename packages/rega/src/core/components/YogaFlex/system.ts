// Yoga layout system
import { FlexStyle, applyStyle } from "./FlexStyle";
import Yoga, { Node, MeasureFunction, Direction } from "yoga-layout";
import { diffStyle } from "./YogaNode";

export interface YogaFragment {
  type: "yoga_fragment";
  children: (YogaElement | YogaFragment)[];
}

type YogaChildElement = YogaElement | YogaFragment;

function traverseTree(
  el: YogaElement | YogaFragment,
  cb: (el: YogaElement) => void
) {
  if (el.type === "yoga_element") {
    cb(el);
  }
  for (const child of el.children) {
    traverseTree(child, cb);
  }
}

export class YogaSystem {
  public markDirty() {}

  public rootElement: YogaElement;

  constructor() {
    this.rootElement = new YogaElement(this);
  }

  public calculateLayout() {
    this.rootElement.node.calculateLayout(undefined, undefined, Direction.LTR);
    traverseTree(this.rootElement, (el) => {
      if (el.onLayout) {
        el.onLayout(el.node);
      }
    });
  }
}

export class YogaElement {
  public type = "yoga_element" as const;

  private sysyem: YogaSystem;
  public node: Node;

  private style: FlexStyle;

  public children: YogaChildElement[] = [];

  public onLayout?: (node: Node) => void;

  constructor(system: YogaSystem) {
    this.sysyem = system;
    this.style = {};
    this.node = Yoga.Node.create();
  }

  setStyle(style: FlexStyle) {
    const diff = diffStyle(this.style, style);
    if (Object.keys(diff).length > 0) {
      applyStyle(this.node, diff);
      this.style = style;
      this.sysyem.markDirty();
    }
  }

  setMeasureFunc(func?: MeasureFunction) {
    if (func) {
      this.node.setMeasureFunc(func);
    } else {
      this.node.unsetMeasureFunc();
    }
  }

  public appendChild(child: YogaChildElement) {
    this.children.push(child);
  }
}
