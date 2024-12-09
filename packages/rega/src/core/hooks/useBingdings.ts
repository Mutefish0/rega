import { useMemo } from "react";
import { TransferResource, UniformType } from "../render";
import {
  createUniformBinding,
  BindingUpdater,
  BindingsLayout,
} from "../render/binding";

export default function useBindings<T extends BindingsLayout>(
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

    const checkTypeList: UniformType[] = [
      "texture_2d",
      "texture_2d<sint>",
      "texture_2d<uint>",
      "sampler",
    ];

    const checked = {} as Record<string, boolean>;

    for (const name in obj) {
      const type = obj[name];
      let t = type;
      const h = createUniformBinding(t);
      resources[name] = h.resource;
      updates[name] = h.update;

      if (checkTypeList.includes(t)) {
        checked[name] = false;
      }
    }

    if (initilizer) {
      const checkUpdates = {} as {
        [K in keyof T]: BindingUpdater<T[K] extends UniformType ? T[K] : never>;
      };
      for (const name in updates) {
        checkUpdates[name] = (...args) => {
          checked[name] = true;
          updates[name](...args);
        };
      }

      initilizer(checkUpdates);
    }

    for (const name in checked) {
      if (!checked[name]) {
        throw new Error(`Initialization required for ${obj[name]}: ${name}`);
      }
    }

    return {
      resources,
      updates,
    };
  }, []);
}
