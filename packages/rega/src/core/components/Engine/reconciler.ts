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

import { RenderElement } from "../../render/system";

type Props<T extends HostType> = T extends "yoga" ? YogaElementProps : {};

// @ts-ignore
const isDeno = typeof Deno !== "undefined";

interface HostContainer {
  yogaRoots: YogaElement[];
}

// - yogaContext  eachHostNode
//

interface YogaContext {
  root: YogaElement;
  ancestor: YogaElement;
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

// function assignYogaContextTree(instance: HostInstance) {
//   const roots: YogaElement[] = [];
//   traverseTreeBFS(instance, (instance) => {
//     const parent = instance.parent;
//     if (parent) {
//       if (!parent.yogaContext.root && parent.yogaContext.current) {
//         instance.yogaContext.root = parent.yogaContext.current;
//         instance.yogaContext.ancestor = parent.yogaContext.current;
//         roots.push(parent.yogaContext.current);
//       } else {
//         instance.yogaContext.root = parent.yogaContext.root;
//         instance.yogaContext.ancestor =
//           parent.yogaContext.current || parent.yogaContext.ancestor;
//       }
//     }
//   });
//   return roots;
// }

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
  appendChild(parent, child) {
    child.parent = parent;
    parent.children.push(child);

    if (parent.yogaContext.ancestor) {
      const commonAncestor = parent.yogaContext.ancestor;

      const newTopAdded = new Set<YogaElement>();

      traverseTreeBFS(child, (instance) => {
        const parent = instance.parent!;
        if (
          parent.ancestor === commonAncestor &&
          instance.yogaContext.current
        ) {
          newTopAdded.add(instance.yogaContext.current);
        }

        // assign fiber context
        instance.yogaContext.root = parent.yogaContext.root;
        instance.yogaContext.ancestor =
          parent.yogaContext.current || parent.yogaContext.ancestor;

        // build yoga element tree
        if (instance.yogaContext.current) {
          instance.yogaContext.current.parent = instance.yogaContext.ancestor;
          instance.yogaContext.current.parent.children.push(
            instance.yogaContext.current
          );
        }
      });

      // connect yoga internal tree
      for (const top of newTopAdded) {
        traverseTreeBFS(top, (el) => {
          YogaSystem.appendChild(el.parent!, el);
        });
      }

      if (newTopAdded.size > 0) {
        YogaSystem.markDirty(parent.yogaContext.root);
      }
    }
  },

  // building  tree: bottom-up
  appendInitialChild(parent, child: HostInstance) {
    // build fiber tree
    parent.children.push(child);
    child.parent = parent;
  },

  insertBefore(
    parentInstance: HostInstance,
    child: HostInstance,
    beforeChild: HostInstance
  ) {},

  removeChild(parentInstance: HostInstance, child: HostInstance) {
    //
    traverseTreePreDFS(child, (instance) => {
      if (instance.yogaContext.current) {
        YogaSystem.removeChild(
          instance.yogaContext.ancestor,
          instance.yogaContext.current
        );
        return true;
      }
    });

    const index = parentInstance.children.indexOf(child);
    if (index > -1) {
      parentInstance.children.splice(index, 1);
    }
    child.parent = null;
  },

  appendChildToContainer(container, instance: HostInstance) {
    const roots = new Set<YogaElement>();
    // build fiber context tree + build yoga element tree
    if (instance.yogaContext.current) {
      instance.yogaContext.root = instance.yogaContext.current;
      instance.yogaContext.ancestor = instance.yogaContext.current;
      roots.add(instance.yogaContext.current);
    }
    for (const child of instance.children) {
      traverseTreeBFS(child, (instance) => {
        const parent = instance.parent!;
        // find root
        if (!parent.yogaContext.root && instance.yogaContext.current) {
          instance.yogaContext.root = instance.yogaContext.current;
          instance.yogaContext.ancestor = instance.yogaContext.current;
          roots.add(instance.yogaContext.current);
        } else {
          instance.yogaContext.root = parent.yogaContext.root;
          instance.yogaContext.ancestor =
            parent.yogaContext.current || parent.yogaContext.ancestor;
          if (instance.yogaContext.current) {
            instance.yogaContext.current.parent = instance.yogaContext.ancestor;
            instance.yogaContext.current.parent.children.push(
              instance.yogaContext.current
            );
          }
        }
      });
    }

    // connect yoga internal tree
    for (const root of roots) {
      for (const child of root.children) {
        traverseTreeBFS(child, (el) => {
          YogaSystem.appendChild(el.parent!, el);
        });
      }
      YogaSystem.markDirty(root);
    }

    container.yogaRoots.push(...Array.from(roots));
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
      YogaSystem.markDirty(instance.yogaContext.root);
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
