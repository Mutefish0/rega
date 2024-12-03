import Reconciler from "react-reconciler";
import { DefaultEventPriority } from "react-reconciler/constants";

import { YogaElement, YogaFragment, YogaSystem } from "../YogaFlex/system";
import { RenderElement } from "../../render/system";

// @ts-ignore
const isDeno = typeof Deno !== "undefined";

interface Fragment<T> {
  children: T[];
}

interface HostInstance {
  yogaElement?: YogaElement;
  yogaFragment?: YogaFragment;
  renderElement?: RenderElement;
}

type HostType = "yoga" | "rend";

// <rend>
// <yoga>

// dom
// yoga

const reconciler = Reconciler<
  HostType,
  {}, // props
  {
    // container
    yogaSystem: YogaSystem;
  },
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

  createInstance(type, props, rootContainer) {
    if (type === "yoga") {
      const el = new YogaElement(rootContainer.yogaSystem);
      return {
        yogaElement: el,
      };
    } else if (type === "rend") {
      // TODO
    }
    return {};
  },

  appendChild(parent, child: HostInstance) {
    //parent.children = parent.children || [];
    //parent.children.push(child);

    debugger;
  },

  // bottom-up
  appendInitialChild(parent, child: HostInstance) {
    if (child.yogaElement) {
      if (parent.yogaElement) {
        parent.yogaElement.appendChild(child.yogaElement);
      } else {
        parent.yogaFragment = parent.yogaFragment || {
          type: "yoga_fragment" as const,
          children: [],
        };
        parent.yogaFragment.children.push(child.yogaElement);
      }
    } else if (child.yogaFragment) {
      if (parent.yogaElement) {
        parent.yogaElement.appendChild(child.yogaFragment);
      } else {
        parent.yogaFragment = parent.yogaFragment || {
          type: "yoga_fragment",
          children: [],
        };
        parent.yogaFragment.children.push(child.yogaFragment);
      }
    }
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
    debugger;
  },

  appendChildToContainer(container, child: HostInstance) {
    if (child.yogaElement) {
      container.yogaSystem.rootElement.appendChild(child.yogaElement);
    }
    //if (container.yogaSystem) {}
    //if () {}
    // container.children = container.children || [];
    // container.children.push(child);
  },

  removeChildFromContainer(container: any, child: HostInstance) {},

  getChildHostContext: (parentHostContext) => parentHostContext,

  insertInContainerBefore(
    container: any,
    child: HostInstance,
    beforeChild: HostInstance
  ) {},

  createTextInstance() {
    return null;
  },

  prepareUpdate(instance, type, oldProps, newProps) {
    debugger;
  },

  commitUpdate(
    instance,
    updatePayload,
    type,
    prevProps,
    nextProps,
    internalHandle
  ) {
    debugger;
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
