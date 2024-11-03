import type { WGSLValueType } from "pure3";
import { TransferResource, ResourceType } from "./types";
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

// type _Length<X extends any[]> = X["length"] extends infer U
//   ? U extends number
//     ? U
//     : 0
//   : 0;
// type NNumberArray<
//   N extends number,
//   R extends number[] = []
// > = R["length"] extends N ? R : NNumberArray<N, [number, ...R]>;

// type ElementLenght<T extends WGSLValueType> = T extends "float"
//   ? 1
//   : T extends "vec2"
//   ? 2
//   : T extends "vec3"
//   ? 3
//   : T extends "vec4"
//   ? 4
//   : T extends "mat2"
//   ? 4
//   : T extends "mat3"
//   ? 9
//   : T extends "mat4"
//   ? 16
//   : never;

// export function createBinding(resourceType: ResourceType) {
//   if (resourceType === "uniformBuffer") {
//     //
//   } else if (resourceType === "sampledTexture") {
//     //
//   } else {
//     throw new Error("createBinding: Invalid resource type");
//   }
// }

export function createUniformBinding<T extends WGSLValueType>(type: T) {
  const byteLength = wgslValueTypeToByteLength[type];
  const sab = createSharedBuffer(byteLength);

  const dataView = new wgslValueTypeToByteLengthToViewType[type](
    sab,
    HEADER_SIZE
  );

  const versionView = createVersionView(sab);

  const resource: TransferResource = {
    type: "uniformBuffer",
    buffer: sab,
  };

  function update(values: number[]) {
    dataView.set(values);
    updateVersion(versionView);
  }

  return {
    resource,
    update,
  };
}

export function createUniformBindingView<T extends WGSLValueType>(
  sab: SharedArrayBuffer,
  type: T
) {
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
