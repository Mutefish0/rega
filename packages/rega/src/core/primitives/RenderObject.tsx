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
import createVertexHandle from "../render/createVertexHandle";
import createMaterial from "../render/createMaterial";
import { Node } from "pure3";

interface Props {
  vertexNode: Node<"vec4">;
  fragmentNode: Node<"vec4">;
  input: {
    vertexCount: number;
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

  const vertexHandle = useMemo(
    () => createVertexHandle(material, input.vertexCount),
    []
  );

  useEffect(() => {
    for (const key in input.attributes) {
      if (refLastAttributes.current[key] !== input.attributes[key]) {
        vertexHandle.update(key, input.attributes[key]);
        refLastAttributes.current[key] = input.attributes[key];
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
          binding: layout.binding,
          resource,
        });
      } else {
        if (layout.type === "sampler") {
          objectBindings.push({
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
