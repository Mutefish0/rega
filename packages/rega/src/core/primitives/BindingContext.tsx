import { createContext, useMemo } from "react";
import { TransferResource, UniformType } from "../render";
import {
  createUniformBinding,
  BindingHandle,
  BindingUpdater,
} from "../render/binding";
import { WGSLValueType } from "pure3";

export const BindingContext = createContext(
  {} as Record<string, TransferResource>
);

export const BindingContextProvider = BindingContext.Provider;

export function useBinding<T extends WGSLValueType | "sampler">(
  type: T
): BindingHandle<T>;
export function useBinding<T extends "texture_2d">(
  type: T,
  textureId: string
): BindingHandle<T>;
export function useBinding<T extends UniformType>(type: T, textureId?: string) {
  const binding = useMemo(
    () => createUniformBinding(type as any, textureId as any),
    []
  );
  return binding;
}

export function useBindings<
  T extends Record<
    string,
    WGSLValueType | { type: "texture_2d"; textureId?: string }
  >
>(
  obj: T
): {
  resources: Record<string, TransferResource>;
  updates: {
    [K in keyof T]: T[K] extends WGSLValueType
      ? BindingUpdater<WGSLValueType>
      : T[K] extends { type: "texture_2d"; textureId: string }
      ? BindingUpdater<"texture_2d">
      : never;
  };
} {
  return useMemo(() => {
    const resources = {} as Record<string, TransferResource>;
    const updates: Record<string, any> = {};
    for (const name in obj) {
      const type = obj[name];
      if (typeof type === "string") {
        const h = createUniformBinding(type as WGSLValueType);
        resources[name] = h.resource;
        updates[name] = h.update;
      } else if (type.type === "texture_2d") {
        const h = createUniformBinding("texture_2d", type.textureId || "");
        resources[name] = h.resource;
        updates[name] = h.update;
      }
    }
    return {
      resources,
      updates,
    } as any;
  }, []);
}

// function Test<T extends Record<string, any>>(
//   obj: T
// ): {
//   [K in keyof T]: T[K] extends string ? "s" : T[K] extends number ? "n" : "o";
// } {
//   const typeObj = {} as {
//     [K in keyof T]: T[K] extends string ? "s" : T[K] extends number ? "n" : "o";
//   };
//   for (const key in obj) {
//     if (typeof obj[key] === "string") {
//       typeObj[key] = "s" as any;
//     } else if (typeof obj[key] === "number") {
//       typeObj[key] = "n" as any;
//     } else {
//       typeObj[key] = "o" as any;
//     }
//   }
//   return typeObj;
// }
