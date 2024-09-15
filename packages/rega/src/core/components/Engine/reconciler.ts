import Reconciler from "react-reconciler";
import { DefaultEventPriority } from "react-reconciler/constants";
// @ts-ignore
const isDeno = typeof Deno !== "undefined";

const reconciler = Reconciler({
  clearContainer() {},

  createInstance(type, props) {
    return null;
  },
  appendChild(parent, child) {
    return null;
  },

  appendChildToContainer() {},

  removeChildFromContainer() {},

  createTextInstance() {
    return null;
  },

  supportsMutation: true,
  supportsPersistence: false,

  appendInitialChild(parent, child) {
    return null;
  },

  // deprecated
  prepareUpdate() {},
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

  getChildHostContext: () => {},

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
