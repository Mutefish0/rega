import { useContext, useEffect, useMemo, useRef } from "react";
import TransformContext from "./TransformContext";
import RenderContext from "./RenderContext";
import { RenderGroupContext } from "./RenderGroup";
import {
  NamedBindingLayout,
  TransferBinding,
  TransferResource,
} from "../render";
import { BindingContext } from "./BindingContext";
import { createUniformBinding } from "../../core/render/binding";
import { getOrcreateSlot } from "../render/slot";
import { differenceBy } from "lodash";
import { VertexHandle } from "../render/types";
import createVertexHandle from "../render/createVertexHandle";
import createMaterial from "../render/createMaterial";
import { Node } from "pure3";

const _cache: Record<string, VertexHandle> = {};

interface Props {
  vertexNode: Node<"vec4">;
  fragmentNode: Node<"vec4">;
  input: {
    vertexCount: number;
    sharedVertexKey?: string;
    attributes: Record<string, number[]>;
    index: {
      indexBuffer: SharedArrayBuffer;
      indexCount: number;
    };
  };
}

export default function RenderObject({
  vertexNode,
  fragmentNode,
  input,
}: Props) {
  const id = useMemo(() => crypto.randomUUID(), []);
  const rgCtx = useContext(RenderGroupContext);
  const renderCtx = useContext(RenderContext);
  const transform = useContext(TransformContext);
  const bindingCtx = useContext(BindingContext);
  const refTargets = useRef({
    targetIds: [] as string[],
  });
  const refLastAttributes = useRef<Record<string, number[]>>({});

  const bModelWorldMatrix = useMemo(() => createUniformBinding("mat4"), []);

  function getBindingLayout(name: string) {
    if (renderCtx.renderTargetBindGroupLayout[name]) {
      return {
        group: 1,
        binding: getOrcreateSlot("target", name),
      };
    } else {
      return {
        group: 0,
        binding: getOrcreateSlot("object", name),
      };
    }
  }

  const material = useMemo(
    () => createMaterial(vertexNode, fragmentNode, getBindingLayout),
    [vertexNode, fragmentNode]
  );

  const vertexHandle = useMemo(() => {
    if (input.sharedVertexKey) {
      let handle = _cache[input.sharedVertexKey];
      if (!handle) {
        handle = createVertexHandle(material, input.vertexCount);
        for (const attr of material.attributes) {
          const attributeName = attr.name;
          const value = input.attributes[attributeName];
          if (typeof value === "undefined") {
            throw new Error(`Missing attribute ${attributeName}`);
          }
          handle.update(attributeName, input.attributes[attributeName]);
        }
        _cache[input.sharedVertexKey] = handle;
      }
      return handle;
    } else {
      return createVertexHandle(material, input.vertexCount);
    }
  }, []);

  useEffect(() => {
    if (input.sharedVertexKey) {
      return;
    }
    for (const attr of material.attributes) {
      const attributeName = attr.name;
      const value = input.attributes[attributeName];
      if (typeof value === "undefined") {
        throw new Error(`Missing attribute ${attributeName}`);
      }
      if (refLastAttributes.current[attributeName] !== value) {
        vertexHandle.update(attributeName, value);
        refLastAttributes.current[attributeName] = value;
      }
    }
  }, [input.attributes]);

  useEffect(() => {
    const mat = transform.leafMatrix;
    bModelWorldMatrix.update(mat.elements);
  }, [transform]);

  useEffect(() => {
    const allBindings = {
      ...bindingCtx,
      modelWorldMatrix: bModelWorldMatrix.resource,
    } as Record<string, TransferResource>;

    const objectBindings: TransferBinding[] = [];

    for (const layout of material.bindGroups[0]) {
      const name = layout.name;
      const resource = allBindings[name];
      if (resource) {
        objectBindings.push({
          name,
          binding: layout.binding,
          resource,
        });
      } else {
        if (layout.type === "sampler") {
          objectBindings.push({
            name,
            binding: layout.binding,
            resource: {
              type: "sampler",
            },
          });
        } else {
          throw new Error(`Missing binding ${name}`);
        }
      }
    }

    const targetBindingLayouts: NamedBindingLayout[] = [];

    for (const name in renderCtx.renderTargetBindGroupLayout) {
      targetBindingLayouts.push({
        name,
        type: renderCtx.renderTargetBindGroupLayout[name],
        binding: getOrcreateSlot("target", name),
      });
    }

    renderCtx.server.createObject({
      id,
      material: {
        ...material,
        bindGroups: [material.bindGroups[0], targetBindingLayouts, [], []],
      },
      bindings: objectBindings,
      input: {
        vertexBuffers: vertexHandle.buffers,
        vertexCount: input.vertexCount,
        index: input.index,
      },
    });
    return () => {
      renderCtx.server.removeObject(id);
    };
  }, []);

  useEffect(() => {
    const prevIds = refTargets.current.targetIds;
    const currentIds = rgCtx.targetIds;
    const addedIds = differenceBy(currentIds, prevIds);
    const removedIds = differenceBy(prevIds, currentIds);
    removedIds.forEach((targetId) => {
      renderCtx.server.removeObjectFromTarget(targetId, id);
    });
    addedIds.forEach((targetId) => {
      renderCtx.server.addObjectToTarget(targetId, id);
    });
    refTargets.current.targetIds = rgCtx.targetIds;
  }, [rgCtx]);

  return null;
}
