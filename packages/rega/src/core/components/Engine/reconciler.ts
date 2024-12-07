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
import { traverseTreeBFS, traverseTreePreDFS } from "../../tools/tree";

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

type Element<T> = {
  parent: Element<T> | null;
  children: Element<T>[];
} & T;

function connect<T extends any>(
  parent: Element<T>,
  child: Element<T>,
  beforeIndex?: number
) {
  child.parent = parent;
  if (typeof beforeIndex === "number") {
    parent.children.splice(beforeIndex, 0, child);
  } else {
    parent.children.push(child);
  }
}

function disconnect<T extends any>(parent: Element<T>, child: Element<T>) {
  const index = parent.children.indexOf(child);
  if (index > -1) {
    parent.children.splice(index, 1);
  }
  child.parent = null;
}

// build yoga fiber context tree
// build yoga element tree
function buildYogaSubtree(instance: HostInstance, rootContext?: YogaContext) {
  const roots = new Set<YogaElement>();
  traverseTreeBFS(instance, (instance) => {
    const parent = instance.parent!;
    // // assign root context
    if ((!parent || !parent.yogaContext.root) && instance.yogaContext.current) {
      instance.yogaContext.root = rootContext
        ? rootContext.root
        : instance.yogaContext.current;
      instance.yogaContext.ancestor = rootContext
        ? rootContext.current || rootContext.ancestor
        : instance.yogaContext.current;

      roots.add(instance.yogaContext.current);
    } else if (parent) {
      // build context
      instance.yogaContext.root = parent.yogaContext.root;
      instance.yogaContext.ancestor =
        parent.yogaContext.current || parent.yogaContext.ancestor;

      if (instance.yogaContext.current) {
        // build element tree
        connect(instance.yogaContext.ancestor!, instance.yogaContext.current);
        // build yoga internal tree
        YogaSystem.appendChild(
          instance.yogaContext.current.parent!,
          instance.yogaContext.current
        );
      }
    }
  });
  return Array.from(roots);
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
    // 如果 react-reconciler，
    //    fiberA
    //     /  \
    //  fiberB fiberC
    // sibling 指向：
    // fiberB -> fiberC -> null
    // 因此如果 替换最后两个节点的话，beforeChild会变成 null
    // 这种情况下 react-reconciler 会把 insertBefore 操作会直接优化为 appendChild 操作
    // https://github.com/facebook/react/blob/7283a213dbbc31029e65005276f12202558558fc/packages/react-reconciler/src/ReactFiberCommitHostEffects.js#L314
    // 因为 DOM 的 appendChild 操作是支持 inplace 的
    // 但是 yoga 的不支持，会导致报错，因此，这里我们需要先删除，然后再添加
    let isReused = false;
    let collectedYogaRoots: YogaElement[] = [];

    if (child.parent === parent) {
      isReused = true;
      collectedYogaRoots = collectYogaSubtrees(child);
      for (const root of collectedYogaRoots) {
        // keepalive!
        YogaSystem.removeChild(root.parent!, root, true);
        disconnect(root.parent!, root);
      }
      disconnect(parent, child);
    }

    if (parent.yogaContext.ancestor) {
      const roots = isReused
        ? collectedYogaRoots
        : buildYogaSubtree(child, parent.yogaContext);
      for (const root of roots) {
        YogaSystem.appendChild(parent.yogaContext.ancestor, root);
        connect(parent.yogaContext.ancestor, root);
      }
      YogaSystem.markDirty(parent.yogaContext.root!);
    } else {
      const roots = isReused ? collectedYogaRoots : buildYogaSubtree(child);
      for (const root of roots) {
        YogaSystem.markDirty(root);
        parent.container.yogaRoots.push(root);
      }
    }

    connect(parent, child);
  },

  // building fiber tree: bottom-up
  appendInitialChild(parent, child: HostInstance) {
    // build fiber tree
    connect(parent, child);
  },

  insertBefore(
    parentInstance: HostInstance,
    // 有可能是老的、也有可能是全新创建的！
    child: HostInstance,
    beforeChild: HostInstance
  ) {
    // inplace insert
    if (child.parent) {
      const ancestor = parentInstance.yogaContext.ancestor;
      if (ancestor) {
        const yogaRoots1 = collectYogaSubtrees(child);
        if (yogaRoots1.length > 0) {
          const yogaRoots2 = collectYogaSubtrees(beforeChild);
          if (yogaRoots2.length > 0) {
            for (const root of yogaRoots1) {
              // keepalive!
              YogaSystem.removeChild(root.parent!, root, true);
              disconnect(root.parent!, root);
            }
            let startIndex = ancestor.children.indexOf(yogaRoots2[0]);
            for (const root of yogaRoots1) {
              YogaSystem.insertBeforeIndex(ancestor, root, startIndex);
              connect(ancestor, root, startIndex);
              startIndex++;
            }
            YogaSystem.markDirty(parentInstance.yogaContext.root!);
          }
        }
      } else {
        // they are all container roots, so the order dose't matter
      }
    } else {
      // for newly created child!
      const yogaRoots1 = parentInstance.yogaContext.ancestor
        ? buildYogaSubtree(child, parentInstance.yogaContext)
        : buildYogaSubtree(child);

      if (yogaRoots1.length > 0) {
        const ancestor = parentInstance.yogaContext.ancestor;
        if (ancestor) {
          const yogaRoots2 = collectYogaSubtrees(beforeChild);
          if (yogaRoots2.length > 0) {
            let startIndex = ancestor.children.indexOf(yogaRoots2[0]);
            for (const root of yogaRoots1) {
              YogaSystem.insertBeforeIndex(ancestor, root, startIndex);
              connect(ancestor, root, startIndex);
              startIndex++;
            }
          } else {
            // just append to ancestor
            for (const root of yogaRoots1) {
              YogaSystem.appendChild(ancestor, root);
              connect(ancestor, root);
            }
          }
          YogaSystem.markDirty(parentInstance.yogaContext.root!);
        } else {
          // just append to the container, the order dose't matter
          for (const root of yogaRoots1) {
            parentInstance.container.yogaRoots.push(root);
            YogaSystem.markDirty(root);
          }
        }
      }
    }

    disconnect(parentInstance, child);
    connect(
      parentInstance,
      child,
      parentInstance.children.indexOf(beforeChild)
    );
  },

  insertInContainerBefore(
    container: any,
    child: HostInstance,
    beforeChild: HostInstance
  ) {
    // 一般情况下不会发生
  },

  removeChild(parentInstance: HostInstance, child: HostInstance) {
    const roots = collectYogaSubtrees(child);
    for (const root of roots) {
      YogaSystem.removeChild(root.parent, root);
      disconnect(root.parent!, root);
    }
    disconnect(parentInstance, child);
  },

  appendChildToContainer(container, instance: HostInstance) {
    const roots = buildYogaSubtree(instance);
    for (const root of roots) {
      YogaSystem.markDirty(root);
    }
    container.yogaRoots.push(...roots);
  },

  removeChildFromContainer(container, child) {
    if (child.yogaContext.current) {
      YogaSystem.removeChild(null, child.yogaContext.current);
      disconnect({ children: container.yogaRoots }, child.yogaContext.current);
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
