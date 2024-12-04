import Reconciler from "react-reconciler";
import { DefaultEventPriority } from "react-reconciler/constants";

import {
  YogaElement,
  YogaFragment,
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
  yogaElement?: YogaElement;
  yogaFragment?: YogaFragment;
  renderElement?: RenderElement;
}

type HostType = "yoga" | "rend";

interface YogaDiffPayload {
  styleDiffs?: FlexStyle;
  measureFunc?: MeasureFunction | "unset";
}

function instanceHasYoga(instance: HostInstance) {
  return !!(instance.yogaElement || instance.yogaFragment);
}
function instanceHasRend(instance: HostInstance) {
  return !!instance.renderElement;
}

// function findAncestor(instance: HostInstance, type: HostType) {
//   const check = type === "yoga" ? instanceHasYoga : instanceHasRend;
//   do {
//     if (check(instance)) {
//       return instance;
//     }
//   } while ((instance = instance.parent!));

//   return null;
// }

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
      const el = YogaSystem.createElement();
      const { onLayout, measureFunc, style } = props as Props<"yoga">;
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
        yogaElement: el,
      };
    } else if (type === "rend") {
      // TODO
    }
    return { parent: null, container };
  },

  // updates tree: bottom-up
  appendChild(parent, child) {
    // const childYogaNode = child.yogaElement || child.yogaFragment;
    // if (childYogaNode) {
    //   let node = parent;
    //   while (node) {
    //     if (node.yogaElement) {
    //       YogaSystem.appendChild(node.yogaElement, childYogaNode);
    //       break;
    //     } else if (node.yogaFragment) {
    //       //
    //     } else {
    //       node.yogaFragment = YogaSystem.createFragment();
    //     }
    //     node = node.parent!;
    //   }
    //   parent.container.yogaSystem.markDirty();
    // }
    //const parentYogaNode = child.yogaElement || child.yogaFragment;
    //const childYogaNode = parent.yogaElement || parent.yogaFragment;
    // if (parentYogaNode && childYogaNode) {
    //   YogaSystem.appendChild(parentYogaNode, childYogaNode);
    // }
  },

  // building  tree: bottom-up
  appendInitialChild(parent, child: HostInstance) {
    let childYogaNode = child.yogaElement || child.yogaFragment;
    if (childYogaNode) {
      if (parent.yogaElement) {
        if (child.yogaElement) {
          YogaSystem.appendChild(parent.yogaElement, child.yogaElement);
        } else if (child.yogaFragment) {
          YogaSystem.appendChildFragment(
            parent.yogaElement,
            child.yogaFragment
          );
        }
      } else {
        parent.yogaFragment =
          parent.yogaFragment || YogaSystem.createFragment();
        parent.yogaFragment.children.push(childYogaNode);
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
    debugger;
  },

  removeChild(parentInstance: HostInstance, child: HostInstance) {
    child.parent = null;

    const parentYogaNode =
      parentInstance.yogaElement || parentInstance.yogaFragment;
    const childYogaNode = child.yogaElement || child.yogaFragment;

    if (parentYogaNode && childYogaNode) {
      YogaSystem.removeChild(parentYogaNode, childYogaNode);
      if (
        parentYogaNode.type === "yoga_fragment" &&
        parentYogaNode.children.length === 0
      ) {
        // remove fragment
        parentInstance.yogaFragment = undefined;
      }
      parentInstance.container.yogaSystem.markDirty();
    }
  },

  appendChildToContainer(container, child: HostInstance) {
    if (child.yogaElement) {
      YogaSystem.appendChild(
        container.yogaSystem.rootElement,
        child.yogaElement
      );
      container.yogaSystem.markDirty();
    } else if (child.yogaFragment) {
      YogaSystem.appendChildFragment(
        container.yogaSystem.rootElement,
        child.yogaFragment
      );
      container.yogaSystem.markDirty();
    }
  },

  removeChildFromContainer(container: any, child: HostInstance) {},

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
        instance.yogaElement!.onLayout = newProps.onLayout;
      }

      if (Object.keys(payload).length > 0) {
        return payload;
      }
    }
    return null;
  },

  commitUpdate(instance, _updatePayload, type) {
    if (type === "yoga") {
      const payload = _updatePayload as YogaDiffPayload;
      if (payload.styleDiffs) {
        YogaSystem.applyStyle(instance.yogaElement!, payload.styleDiffs);
      }
      if (payload.measureFunc) {
        YogaSystem.setMeasureFunc(
          instance.yogaElement!,
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
