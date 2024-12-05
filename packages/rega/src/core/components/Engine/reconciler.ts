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

// - yogaContext  eachHostNode
//

interface YogaContext {
  root: YogaElement;
  ancestor: YogaElement;
  current: YogaElement | null;
  fragment?: YogaContext[];
}

interface HostInstance {
  container: HostContainer;
  parent: HostInstance | null;
  children: HostInstance[];
  yogaContext: YogaContext;
}

type HostType = "yoga" | "rend";

interface YogaDiffPayload {
  styleDiffs?: FlexStyle;
  measureFunc?: MeasureFunction | "unset";
}

// function findAncestorYogaElement(instance: HostInstance) {
//   let parent = instance;
//   do {
//     if (
//       parent.yogaElementNode &&
//       parent.yogaElementNode.type === "yoga_element"
//     ) {
//       return parent.yogaElementNode;
//     }
//   } while ((parent = parent.parent!));
//   return instance.container.yogaSystem.rootElement;
// }

// function leftMostYogaElement(el: YogaFragment) {
//   let leftMost = el.children[0];
//   while (leftMost && leftMost.type === "yoga_fragment") {
//     leftMost = leftMost.children[0];
//   }
//   return leftMost;
// }

// <rend>
// <yoga>

// dom
// yoga

function traverseTreeDFS(
  instance: HostInstance,
  cb: (instance: HostInstance) => void
) {
  cb(instance);
  for (const child of instance.children) {
    traverseTreeDFS(child, cb);
  }
}

function traverseTreeBFS(
  instance: HostInstance,
  cb: (instance: HostInstance) => void
) {
  const queue = [instance];
  while (queue.length > 0) {
    const current = queue.shift()!;
    cb(current);
    queue.push(...current.children);
  }
}

function assignYogaContextTree(instance: HostInstance) {
  traverseTreeBFS(instance, (instance) => {
    if (instance.parent) {
      instance.yogaContext.ancestor =
        instance.parent.yogaContext.current ||
        instance.parent.yogaContext.ancestor;
      instance.yogaContext.root = instance.parent.yogaContext.root;
    }
  });
}

const renderer = Reconciler<
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
        children: [],
        yogaContext: {
          root: null as any,
          ancestor: null as any,
          current: el,
        },
      };
    } else if (type === "rend") {
      // TODO
    }
    return {
      parent: null,
      children: [],
      container,
      yogaContext: { root: null as any, ancestor: null as any, current: null },
    };
  },

  // updates tree: bottom-up
  appendChild(parent, child) {
    child.parent = parent;
  },

  // building  tree: bottom-up
  appendInitialChild(parent, child: HostInstance) {
    // const parentYogaCtx = parent.yogaContext;
    // const childYogaCtx = child.yogaContext;
    // if (parentYogaCtx.current && childYogaCtx.current) {
    //   parentYogaCtx.current.children.push(childYogaCtx.current);
    //   childYogaCtx.ancestor = parentYogaCtx.current;
    //   childYogaCtx.current.parent = parentYogaCtx.current;
    // } else if (
    //   parentYogaCtx.current &&
    //   childYogaCtx.fragment &&
    //   childYogaCtx.fragment.length > 0
    // ) {
    //   for (const childCtx of childYogaCtx.fragment) {
    //     parentYogaCtx.current.children.push(childCtx.current!);
    //     childCtx.current!.parent = parentYogaCtx.current;
    //     childCtx.ancestor = parentYogaCtx.current;
    //   }
    //   childYogaCtx.fragment = undefined;
    // } else if (!parentYogaCtx.current && childYogaCtx.current) {
    //   parentYogaCtx.fragment = parentYogaCtx.fragment || [];
    //   parentYogaCtx.fragment.push(childYogaCtx);
    // } else if (
    //   !parentYogaCtx.current &&
    //   childYogaCtx.fragment &&
    //   childYogaCtx.fragment.length > 0
    // ) {
    //   parentYogaCtx.fragment = parentYogaCtx.fragment || [];
    //   parentYogaCtx.fragment.push(...childYogaCtx.fragment);
    //   childYogaCtx.fragment = undefined;
    // }
    parent.children.push(child);
    child.parent = parent;
  },

  insertBefore(
    parentInstance: HostInstance,
    child: HostInstance,
    beforeChild: HostInstance
  ) {},

  removeChild(parentInstance: HostInstance, child: HostInstance) {},

  // assign contexts
  appendChildToContainer(container, child: HostInstance) {
    //child.yogaContext.root = child.yogaContext.current!;

    assignYogaContextTree(child);
  },

  removeChildFromContainer(container, child) {},

  getChildHostContext: (parentHostContext, type) => {
    return parentHostContext;
  },

  getRootHostContext: () => {},

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
  renderer.injectIntoDevTools({
    bundleType: 1,
    version: "18.3.1",
    rendererPackageName: "rega",
  });
}

export default renderer;
