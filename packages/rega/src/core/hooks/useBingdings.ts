import { useMemo } from "react";
import {
  TransferResource,
  UniformType,
  TransferTextureResource,
} from "../render";
import { createUniformBinding, BindingUpdater } from "../render/binding";

export default function useBindings<T extends Record<string, UniformType>>(
  obj: T,
  initilizer?: (updates: {
    [K in keyof T]: BindingUpdater<T[K] extends UniformType ? T[K] : never>;
  }) => void
): {
  resources: Record<string, TransferResource>;
  updates: {
    [K in keyof T]: BindingUpdater<T[K] extends UniformType ? T[K] : never>;
  };
} {
  return useMemo(() => {
    const resources = {} as Record<string, TransferResource>;
    const updates = {} as {
      [K in keyof T]: BindingUpdater<T[K] extends UniformType ? T[K] : never>;
    };

    const checkList: UniformType[] = [
      "texture_2d",
      "texture_2d<sint>",
      "texture_2d<uint>",
    ];
    const checkInits: string[] = [];

    for (const name in obj) {
      const type = obj[name];
      let t = type;
      const h = createUniformBinding(t);
      resources[name] = h.resource;
      updates[name] = h.update;

      if (checkList.includes(t)) {
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
