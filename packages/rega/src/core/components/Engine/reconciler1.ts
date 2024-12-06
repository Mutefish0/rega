import Reconciler from "react-reconciler";
import { DefaultEventPriority } from "react-reconciler/constants";

import {
  YogaElement,
  YogaSystem,
  YogaElementProps,
  MeasureFunction,
  FlexStyle,
} from "../YogaFlex/system";
import { RenderElement } from "../../render/system";

type Props<T extends HostType> = T extends "yoga" ? YogaElementProps : {};

// @ts-ignore
const isDeno = typeof Deno !== "undefined";

interface HostContainer {
  yogaSystem: YogaSystem;
}

interface HostInstance {
  container: HostContainer;
  parent: HostInstance | null;
  yogaElementNode?: YogaElement | YogaFragment;
  renderElement?: RenderElement;
}

type HostType = "yoga" | "rend";

interface YogaDiffPayload {
  styleDiffs?: FlexStyle;
  measureFunc?: MeasureFunction | "unset";
}

function findAncestorYogaElement(instance: HostInstance) {
  let parent = instance;
  do {
    if (
      parent.yogaElementNode &&
      parent.yogaElementNode.type === "yoga_element"
    ) {
      return parent.yogaElementNode;
    }
  } while ((parent = parent.parent!));
  return instance.container.yogaSystem.rootElement;
}

function leftMostYogaElement(el: YogaFragment) {
  let leftMost = el.children[0];
  while (leftMost && leftMost.type === "yoga_fragment") {
    leftMost = leftMost.children[0];
  }
  return leftMost;
}

// <rend>
// <yoga>

// dom
// yoga

const reconciler = Reconciler<
  HostType,
  any, // props
  HostContainer,
  HostInstance,
  any,
  any,
  any,
  any,
  any,
  any,
  any,
  any,
  any
>({
  supportsMutation: true,
  supportsPersistence: false,
  supportsHydration: false,

  clearContainer() {},

  createInstance<T extends HostType>(
    type: T,
    props: Props<T>,
    container: HostContainer
  ): HostInstance {
    if (type === "yoga") {
      const { onLayout, measureFunc, style, config } = props as Props<"yoga">;
      const el = YogaSystem.createElement(config);
      if (measureFunc) {
        YogaSystem.setMeasureFunc(el, measureFunc);
      }
      if (style) {
        YogaSystem.applyStyle(el, style);
      }
      el.onLayout = onLayout;
      return {
        container,
        parent: null,
        yogaElementNode: el,
      };
    } else if (type === "rend") {
      // TODO
    }
    return { parent: null, container };
  },

  // updates tree: bottom-up
  appendChild(parent, child) {
    if (child.yogaElementNode) {
      let parentYogaEmement: YogaElement;

      //
      if (!parent.yogaElementNode) {
        let connectNodeParent = parent;
        let connectNodeChild = child;
        while (connectNodeParent && !connectNodeParent.yogaElementNode) {
          connectNodeParent.yogaElementNode = YogaSystem.createFragment();
          connectNodeParent.yogaElementNode.children.push(connectNodeChild);
          connectNodeChild = connectNodeParent;
          connectNodeParent = connectNodeParent.parent!;
        }
        //   connect to root
        if (!connectNodeParent) {
          parent.container.yogaSystem.rootElement.children.push(
            connectNodeChild.yogaElementNode
          );
          parentYogaEmement = parent.container.yogaSystem.rootElement;
        } else {
          parentYogaEmement = findAncestorYogaElement(connectNodeParent);
        }
      } else {
        parent.yogaElementNode.children.push(child.yogaElementNode);
        parentYogaEmement = findAncestorYogaElement(parent);
      }

      if (child.yogaElementNode.type === "yoga_element") {
        YogaSystem.appendChild(parentYogaEmement, child.yogaElementNode);
      } else {
        YogaSystem.appendChildFragment(
          parentYogaEmement,
          child.yogaElementNode
        );
      }

      parent.container.yogaSystem.markDirty();
    }

    child.parent = parent;
  },

  // building  tree: bottom-up
  appendInitialChild(parent, child: HostInstance) {
    if (child.yogaElementNode) {
      parent.yogaElementNode =
        parent.yogaElementNode || YogaSystem.createFragment();
      parent.yogaElementNode.children.push(child.yogaElementNode);
      if (parent.yogaElementNode.type === "yoga_element") {
        if (child.yogaElementNode.type === "yoga_element") {
          YogaSystem.appendChild(parent.yogaElementNode, child.yogaElementNode);
        } else {
          YogaSystem.appendChildFragment(
            parent.yogaElementNode,
            child.yogaElementNode
          );
        }
      }
    }

    child.parent = parent;
  },

  insertBefore(
    parentInstance: HostInstance,
    child: HostInstance,
    beforeChild: HostInstance
  ) {
    //
    if (child.yogaElementNode) {
      if (child.yogaElementNode.type === "yoga_element") {
        if (beforeChild.yogaElementNode) {
          if (beforeChild.yogaElementNode.type === "yoga_element") {
            YogaSystem.insertBeforeChild(
              parentInstance.yogaElementNode as YogaElement,
              child.yogaElementNode,
              beforeChild.yogaElementNode
            );
          } else {
            const l = leftMostYogaElement(
              beforeChild.yogaElementNode as YogaFragment
            );
            YogaSystem.insertBeforeChild(
              parentInstance.yogaElementNode as YogaElement,
              child.yogaElementNode,
              l
            );
          }

          parentInstance.container.yogaSystem.markDirty();
        }
      }
    }
  },

  removeChild(parentInstance: HostInstance, child: HostInstance) {
    child.parent = null;
    if (child.yogaElementNode && parentInstance.yogaElementNode) {
      const index = parentInstance.yogaElementNode.children.indexOf(
        child.yogaElementNode
      );
      if (index !== -1) {
        parentInstance.yogaElementNode.children.splice(index, 1);
      }
      const parentYogaEmement = findAncestorYogaElement(parentInstance);
      if (child.yogaElementNode.type === "yoga_element") {
        YogaSystem.removeChild(parentYogaEmement, child.yogaElementNode);
      } else {
        YogaSystem.removeChildFragment(
          parentYogaEmement,
          child.yogaElementNode
        );
      }

      parentInstance.container.yogaSystem.markDirty();
    }
  },

  appendChildToContainer(container, child: HostInstance) {
    if (child.yogaElementNode) {
      container.yogaSystem.rootElement.children.push(child.yogaElementNode);
      if (child.yogaElementNode.type === "yoga_fragment") {
        YogaSystem.appendChildFragment(
          container.yogaSystem.rootElement,
          child.yogaElementNode
        );
      } else {
        YogaSystem.appendChild(
          container.yogaSystem.rootElement,
          child.yogaElementNode
        );
      }
      container.yogaSystem.markDirty();
    }
  },

  removeChildFromContainer(container, child) {
    if (child.yogaElementNode) {
      const index = container.yogaSystem.rootElement.children.indexOf(
        child.yogaElementNode
      );
      if (index !== -1) {
        container.yogaSystem.rootElement.children.splice(index, 1);
      }
      if (child.yogaElementNode.type === "yoga_element") {
        YogaSystem.removeChild(
          container.yogaSystem.rootElement,
          child.yogaElementNode
        );
      } else {
        YogaSystem.removeChildFragment(
          container.yogaSystem.rootElement,
          child.yogaElementNode
        );
      }
      container.yogaSystem.markDirty();
    }
  },

  getChildHostContext: (parentHostContext) => parentHostContext,

  insertInContainerBefore(
    container: any,
    child: HostInstance,
    beforeChild: HostInstance
  ) {
    //
  },

  createTextInstance() {
    return null;
  },

  prepareUpdate(instance, type, _oldProps, _newProps, rootContainer) {
    if (type === "yoga") {
      const yogaElement = instance.yogaElementNode as YogaElement;

      const payload = {} as YogaDiffPayload;
      const oldProps = _oldProps as Props<"yoga">;
      const newProps = _newProps as Props<"yoga">;
      if (oldProps.style !== newProps.style) {
        const styleDiffs = YogaSystem.diffStyle(
          oldProps.style || {},
          newProps.style || {}
        );
        if (styleDiffs) {
          payload.styleDiffs = styleDiffs;
        }
      }

      if (oldProps.measureFunc !== newProps.measureFunc) {
        payload.measureFunc = newProps.measureFunc || "unset";
      }

      // simply assign, no need to update
      if (oldProps.onLayout !== newProps.onLayout) {
        yogaElement!.onLayout = newProps.onLayout;
      }

      if (Object.keys(payload).length > 0) {
        return payload;
      }
    }
    return null;
  },

  commitUpdate(instance, _updatePayload, type) {
    if (type === "yoga") {
      const yogaElement = instance.yogaElementNode as YogaElement;

      const payload = _updatePayload as YogaDiffPayload;
      if (payload.styleDiffs) {
        YogaSystem.applyStyle(yogaElement, payload.styleDiffs);
      }
      if (payload.measureFunc) {
        YogaSystem.setMeasureFunc(
          yogaElement,
          payload.measureFunc === "unset" ? undefined : payload.measureFunc
        );
      }
      instance.container.yogaSystem.markDirty();
    }
  },

  // deprecated
  getInstanceFromNode() {
    return null;
  },
  // deprecated
  beforeActiveInstanceBlur() {},
  // deprecated
  afterActiveInstanceBlur() {},
  // deprecated
  getInstanceFromScope() {
    return null;
  },
  // deprecated
  detachDeletedInstance() {},
  // deprecated
  prepareScopeUpdate() {},

  getPublicInstance(instance) {
    return instance;
  },

  // web - false, deno - true
  isPrimaryRenderer: isDeno ? true : false,

  // In the browser, you can check this using window.event && window.event.type
  getCurrentEventPriority() {
    return DefaultEventPriority;
  },

  preparePortalMount() {},

  scheduleTimeout(fn, delay) {
    return setTimeout(fn, delay);
  },

  cancelTimeout(id) {
    return clearTimeout(id as any);
  },

  noTimeout: -1,

  getRootHostContext: () => {},

  prepareForCommit: () => null,

  resetAfterCommit: () => {},

  shouldSetTextContent: () => false,

  finalizeInitialChildren: (
    instance,
    type,
    props,
    rootContainer,
    hostContext
  ) => {
    return false;
  },
});

// @ts-ignore
if (import.meta.env.DEV) {
  reconciler.injectIntoDevTools({
    bundleType: 1,
    version: "18.3.1",
    rendererPackageName: "rega",
  });
}

export default reconciler;
