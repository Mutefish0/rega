import { createContext, useMemo } from "react";
import { TransferResource, UniformType } from "../render";
import { createUniformBinding } from "../render/binding";
import { WGSLValueType } from "pure3";

export const BindingContext = createContext(
  {} as Record<string, TransferResource>
);

export const BindingContextProvider = BindingContext.Provider;

type UpdateArgs<T extends UniformType> = T extends WGSLValueType
  ? number[]
  : any;

type Result<T extends UniformType> = {
  update: (values: UpdateArgs<T>) => void;
  resource: TransferResource;
};

export function useBinding(
  type: WGSLValueType,
  opts?: never
): Result<WGSLValueType>;
export function useBinding(
  type: "texture_2d",
  opts: { width: number; height: number; buffer: SharedArrayBuffer }
): Result<"texture_2d">;
export function useBinding(type: "sampler"): Result<"sampler">;
export function useBinding<T extends UniformType>(
  type: T,
  opts?: any
): {
  resource: TransferResource;
  update: (values: UpdateArgs<T>) => void;
} {
  const binding = useMemo(() => {
    if (type === "sampler") {
      return {
        update: ((v: {}) => {}) as UpdateArgs<"sampler">,
        resource: { type: "sampler" as const },
      };
    } else if (type === "texture_2d") {
      return {
        update: ((v: {}) => {}) as UpdateArgs<"texture_2d">,
        resource: {
          width: opts.width,
          height: opts.height,
          buffer: opts.buffer,
          type: "sampledTexture" as const,
        },
      };
    } else {
      return createUniformBinding(type);
    }
  }, []);

  return binding;
}

export function useBindings() {}

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
