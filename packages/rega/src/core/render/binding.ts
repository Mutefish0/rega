import type { WGSLValueType } from "pure3";
import { TransferResource, ResourceType, UniformType } from "./types";
import { HEADER_SIZE } from "./sharedBufferLayout";
import createSharedBuffer, {
  createVersionView,
  updateVersion,
} from "./createSharedBuffer";

const wgslValueTypeToByteLength: Record<WGSLValueType, number> = {
  float: 4,
  vec2: 8,
  vec3: 12,
  vec4: 16,
  mat2: 16,
  mat3: 36,
  mat4: 64,
};

const wgslValueTypeToByteLengthToViewType = {
  float: Float32Array,
  vec2: Float32Array,
  vec3: Float32Array,
  vec4: Float32Array,
  mat2: Float32Array,
  mat3: Float32Array,
  mat4: Float32Array,
};

export interface BindingHandle<T extends UniformType> {
  resource: TransferResource;
  update: BindingUpdater<T>;
}

interface BindingView<T extends UniformType> {
  update: BindingUpdater<T>;
  get: Viewer<T>;
}

export type BindingUpdater<
  T extends UniformType,
  A = T extends WGSLValueType
    ? number[]
    : T extends "texture_2d"
    ? string
    : void
> = (values: A) => void;

type Viewer<T extends UniformType> = T extends WGSLValueType
  ? (index: number) => number
  : T extends "texture_2d"
  ? () => string
  : () => void;

function createUniformValueBinding<T extends WGSLValueType>(
  type: T
): BindingHandle<WGSLValueType> {
  const byteLength = wgslValueTypeToByteLength[type];
  const sab = createSharedBuffer(byteLength);
  const v = createUniformValueBindingView(sab, type);

  const resource: TransferResource = {
    type: "uniformBuffer",
    buffer: sab,
  };

  return {
    resource,
    update: v.update,
  };
}
function createUniformValueBindingView<T extends WGSLValueType>(
  sab: SharedArrayBuffer,
  type: T
): BindingView<WGSLValueType> {
  const dataView = new wgslValueTypeToByteLengthToViewType[type](
    sab,
    HEADER_SIZE
  );

  const versionView = createVersionView(sab);

  function get(index: number) {
    return dataView[index];
  }

  function update(values: number[]) {
    dataView.set(values);
    updateVersion(versionView);
  }

  return {
    get,
    update,
  };
}

export function createUniformBinding<T extends WGSLValueType | "sampler">(
  type: T
): BindingHandle<T>;
export function createUniformBinding<T extends "texture_2d">(
  type: T,
  textureId: string
): BindingHandle<"texture_2d">;
export function createUniformBinding<T extends UniformType>(
  type: T,
  textureId?: string
): BindingHandle<T> {
  if (type === "texture_2d") {
    const resource: TransferResource = {
      type: "sampledTexture" as const,
      textureId: textureId!,
    };
    return {
      resource,
      update: (id: string) => {
        resource.textureId = id;
      },
    } as BindingHandle<T>;
  } else if (type === "sampler") {
    return {
      resource: { type: "sampler" as const },
      update: () => {},
    };
  } else {
    return createUniformValueBinding(type) as BindingHandle<T>;
  }
}

export function createUniformBindingView<T extends UniformType>(
  res: TransferResource,
  type: T
): BindingView<T> {
  if (res.type === "sampledTexture") {
    return {
      update: ((id: string) => {
        res.textureId = id;
      }) as any,
      get: (() => res.textureId) as any,
    };
  } else if (res.type === "sampler") {
    return {
      update: () => {},
      get: (() => {}) as any,
    };
  } else if (res.type === "uniformBuffer") {
    return createUniformValueBindingView(
      res.buffer,
      type as any
    ) as BindingView<T>;
  } else {
    throw new Error("Invalid resource type");
  }
}
