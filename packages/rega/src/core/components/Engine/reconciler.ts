import React from "react";
import Reconciler from "react-reconciler";
import { DefaultEventPriority } from "react-reconciler/constants";

import {
  YogaElement,
  YogaSystem,
  YogaElementProps,
  MeasureFunction,
  FlexStyle,
} from "../YogaFlex/system";
import {
  traverseTreeBFS,
  Traversable,
  traverseTreePreDFS,
} from "../../tools/tree";

type Props<T extends HostType> = T extends "yoga" ? YogaElementProps : {};

// @ts-ignore
const isDeno = typeof Deno !== "undefined";

interface HostContainer {
  yogaRoots: YogaElement[];
}

interface YogaContext {
  root: YogaElement | null;
  ancestor: YogaElement | null;
  current: YogaElement | null;
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

function insertBefore<T extends any>(
  parent: Traversable<T>,
  child: Traversable<T>,
  beforeChild: Traversable<T> | number
) {
  const childIndex = parent.children.indexOf(child);
  parent.children.splice(childIndex, 1);
  const beforeIndex =
    typeof beforeChild === "number"
      ? beforeChild
      : parent.children.indexOf(beforeChild);
  parent.children.splice(beforeIndex, 0, child);
}

function disconnect<T extends any>(
  parent: Traversable<T>,
  child: Traversable<T>
) {
  const index = parent.children.indexOf(child);
  if (index > -1) {
    parent.children.splice(index, 1);
  }
}

// build yoga fiber context tree
// build yoga element tree
function buildYogaSubtree(instance: HostInstance, rootContext?: YogaContext) {
  const roots = new Set<YogaElement>();
  traverseTreeBFS(instance, (instance) => {
    const parent = instance.parent!;
    // // assign root context
    if ((!parent || !parent.yogaContext.root) && instance.yogaContext.current) {
      const context = rootContext ?? {
        root: instance.yogaContext.current,
        ancestor: instance.yogaContext.current,
        current: null,
      };
      instance.yogaContext.root = context.root;
      instance.yogaContext.ancestor = context.current || context.ancestor;

      roots.add(instance.yogaContext.current);

      if (rootContext) {
        // connect element tree
        instance.yogaContext.current.parent = rootContext.ancestor;
        instance.yogaContext.current.parent!.children.push(
          instance.yogaContext.current
        );
      }
    } else if (parent) {
      // build context
      instance.yogaContext.root = parent.yogaContext.root;
      instance.yogaContext.ancestor =
        parent.yogaContext.current || parent.yogaContext.ancestor;

      // build element tree
      if (instance.yogaContext.current) {
        instance.yogaContext.current.parent = instance.yogaContext.ancestor;
        instance.yogaContext.current.parent!.children.push(
          instance.yogaContext.current
        );
      }
    }
  });
  return Array.from(roots);
}
function connectYogaTree(root: YogaElement) {
  traverseTreeBFS(root, (el) => {
    if (el.parent) {
      YogaSystem.appendChild(el.parent!, el);
    }
  });
}

function collectYogaSubtrees(instance: HostInstance) {
  const roots: YogaElement[] = [];
  traverseTreePreDFS(instance, (ins) => {
    if (ins.yogaContext.current) {
      roots.push(ins.yogaContext.current);
      return true;
    }
  });
  return roots;
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

  createInstance(type, props, container, _hostContext): HostInstance {
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
  appendChild(parent: HostInstance, child: HostInstance) {
    if (parent.yogaContext.ancestor) {
      const roots = buildYogaSubtree(child, parent.yogaContext);
      for (const root of roots) {
        connectYogaTree(root);
      }
      YogaSystem.markDirty(parent.yogaContext.root!);
    } else {
      const roots = buildYogaSubtree(child);
      for (const root of roots) {
        connectYogaTree(root);
        YogaSystem.markDirty(root);
        parent.container.yogaRoots.push(root);
      }
    }

    child.parent = parent;
    parent.children.push(child);
  },

  // building fiber tree: bottom-up
  appendInitialChild(parent, child: HostInstance) {
    // build fiber tree
    parent.children.push(child);
    child.parent = parent;
  },

  insertBefore(
    parentInstance: HostInstance,
    child: HostInstance,
    beforeChild: HostInstance
  ) {
    if (
      child.yogaContext.ancestor &&
      beforeChild.yogaContext.ancestor &&
      child.yogaContext.ancestor === beforeChild.yogaContext.ancestor
    ) {
      const yogaRoots1 = collectYogaSubtrees(child);
      const yogaRoots2 = collectYogaSubtrees(beforeChild);
      if (yogaRoots1.length > 0 && yogaRoots2.length > 0) {
        for (const root of yogaRoots1) {
          YogaSystem.removeChild(root.parent, root, true);
          disconnect(root.parent!, root);
        }
        const beforeChildRoot = yogaRoots2[0];
        let startIndex =
          beforeChildRoot.parent!.children.indexOf(beforeChildRoot);
        if (startIndex > -1) {
          for (const root of yogaRoots1) {
            YogaSystem.insertBeforeIndex(root.parent!, root, startIndex);
            insertBefore(root.parent!, root, startIndex);
            startIndex++;
          }
        } else {
          console.error(`Yoga: insert index error!`);
        }
        YogaSystem.markDirty(child.yogaContext.root!);
      }
    }

    insertBefore(parentInstance, child, beforeChild);
  },

  insertInContainerBefore(
    container: any,
    child: HostInstance,
    beforeChild: HostInstance
  ) {
    //
  },

  removeChild(parentInstance: HostInstance, child: HostInstance) {
    const roots = collectYogaSubtrees(child);
    for (const root of roots) {
      YogaSystem.removeChild(root.parent, root);
    }
    disconnect(parentInstance, child);
  },

  appendChildToContainer(container, instance: HostInstance) {
    const roots = buildYogaSubtree(instance);
    for (const root of roots) {
      connectYogaTree(root);
      YogaSystem.markDirty(root);
    }
    container.yogaRoots.push(...roots);
  },

  removeChildFromContainer(container, child) {
    if (child.yogaContext.current) {
      const index = container.yogaRoots.indexOf(child.yogaContext.current);
      if (index !== -1) {
        container.yogaRoots.splice(index, 1);
      }
      YogaSystem.removeChild(null, child.yogaContext.current);
    }
  },

  getChildHostContext: (parentHostContext) => {
    return parentHostContext;
  },

  getRootHostContext: () => {},

  createTextInstance() {
    return null;
  },

  prepareUpdate(instance, type, _oldProps, _newProps) {
    if (type === "yoga") {
      const yogaElement = instance.yogaContext.current!;

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
      const yogaElement = instance.yogaContext.current!;
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
      YogaSystem.markDirty(instance.yogaContext.root!);
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
    version: React.version,
    rendererPackageName: "rega",
  });
}

export default renderer;
