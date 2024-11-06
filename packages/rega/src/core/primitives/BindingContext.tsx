import { createContext, useMemo } from "react";
import {
  TransferResource,
  UniformType,
  TransferTextureResource,
} from "../render";
import { createUniformBinding, BindingUpdater } from "../render/binding";
import { Node, WGSLValueType } from "pure3";

export const BindingContext = createContext(
  {} as Record<string, TransferResource>
);

export const BindingContextProvider = BindingContext.Provider;

export function useBindings<
  T extends Record<string, UniformType | Node<WGSLValueType>>
>(
  obj: T,
  initilizer?: (updates: {
    [K in keyof T]: BindingUpdater<
      T[K] extends UniformType
        ? T[K]
        : T[K] extends Node<infer U>
        ? U extends WGSLValueType
          ? U
          : never
        : never
    >;
  }) => void
): {
  resources: Record<string, TransferResource>;
  updates: {
    [K in keyof T]: BindingUpdater<
      T[K] extends UniformType
        ? T[K]
        : T[K] extends Node<infer U>
        ? U extends WGSLValueType
          ? U
          : never
        : never
    >;
  };
} {
  return useMemo(() => {
    const resources = {} as Record<string, TransferResource>;
    const updates = {} as {
      [K in keyof T]: BindingUpdater<
        T[K] extends UniformType
          ? T[K]
          : T[K] extends Node<infer U>
          ? U extends WGSLValueType
            ? U
            : never
          : never
      >;
    };

    const checkInits: string[] = [];

    for (const name in obj) {
      const type = obj[name];
      let t;
      if (typeof type === "object") {
        t = type.nodeType;
      } else {
        t = type;
      }
      const h = createUniformBinding(t);
      resources[name] = h.resource;
      updates[name] = h.update;
      if (type === "texture_2d") {
        checkInits.push(name);
      }
    }

    if (initilizer) {
      initilizer(updates);
    }

    for (const name of checkInits) {
      const res = resources[name] as TransferTextureResource;
      if (!res.textureId) {
        throw new Error(`Initialization required for texture_2d: ${name}`);
      }
    }

    return {
      resources,
      updates,
    };
  }, []);
}
