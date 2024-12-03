import Reconciler from "react-reconciler";
import { DefaultEventPriority } from "react-reconciler/constants";
// @ts-ignore
const isDeno = typeof Deno !== "undefined";

interface HostInstance {
  type: "yoga" | "obj";
}

// dom
// yoga

const reconciler = Reconciler({
  supportsMutation: true,
  supportsPersistence: false,

  clearContainer() {},

  createInstance(type, props, rootContainer) {
    return { type, appendChild: () => {}, removeChild: () => {} };
  },

  appendChild(parent, child) {
    parent.children = parent.children || [];
    parent.children.push(child);
  },

  appendInitialChild(parent, child) {
    parent.children = parent.children || [];
    parent.children.push(child);
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

  appendChildToContainer(container: any, child: HostInstance) {
    container.children = container.children || [];
    container.children.push(child);
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

  prepareUpdate() {},

  commitUpdate(
    instance,
    updatePayload,
    type,
    prevProps,
    nextProps,
    internalHandle
  ) {
    //
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

  supportsHydration: false,

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

  finalizeInitialChildren: () => false,
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
