import { useContext, useEffect, useMemo, useRef } from "react";
import TransformContext from "./TransformContext";
import RenderContext from "./RenderContext";
import { RenderGroupContext } from "./RenderGroup";
import {
  NamedBindingLayout,
  TransferBinding,
  TransferResource,
  TransferTextureResource,
} from "../render";
import { BindingContext } from "./BindingContext";
import { createUniformBinding } from "../../core/render/binding";
import { getOrcreateSlot } from "../render/slot";
import { differenceBy } from "lodash";
import createMaterial from "../render/createMaterial";
import TextureManager, { Texture } from "../common/texture_manager";
import { Node } from "pure3";

interface Props {
  bindings?: Record<string, TransferResource>;

  vertexNode: Node<"vec4">;
  fragmentNode: Node<"vec4">;

  vertexCount: number;
  vertex: Record<string, SharedArrayBuffer>;

  index?: {
    indexCount: number;
    indexBuffer: SharedArrayBuffer;
  };
}

export default function RenderObject({
  vertexNode,
  fragmentNode,
  vertex,
  vertexCount,
  index,
  bindings = {},
}: Props) {
  const id = useMemo(() => crypto.randomUUID(), []);
  const rgCtx = useContext(RenderGroupContext);
  const renderCtx = useContext(RenderContext);
  const transform = useContext(TransformContext);
  const bindingCtx = useContext(BindingContext);
  const refTargets = useRef({
    targetIds: [] as string[],
  });

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

  useEffect(() => {
    const mat = transform.leafMatrix;
    bModelWorldMatrix.update(mat.elements);
  }, [transform]);

  useEffect(() => {
    const allBindings = {
      ...bindingCtx,
      ...bindings,
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
        visibility: 3,
      });
    }

    const textures: Record<string, Texture> = {};

    for (const b of material.bindGroups[0]) {
      if (
        b.type === "sampledTexture" ||
        b.type === "sintTexture" ||
        b.type === "uintTexture"
      ) {
        const res = allBindings[b.name] as TransferTextureResource;
        const texture = TextureManager.get(res.textureId);
        if (!texture) {
          throw new Error(`Missing texture ${res.textureId}`);
        }
        textures[b.name] = texture;
      }
    }

    const vertexBuffers: SharedArrayBuffer[] = [];

    for (const attr of material.attributes) {
      const attributeName = attr.name;
      const buffer = vertex[attributeName];
      if (!buffer) {
        throw new Error(`Missing attribute ${attributeName}`);
      }
      vertexBuffers.push(buffer);
    }

    renderCtx.server.createObject({
      id,
      material: {
        ...material,
        bindGroups: [material.bindGroups[0], targetBindingLayouts, [], []],
      },
      bindings: objectBindings,
      input: {
        vertexBuffers,
        vertexCount,
        index,
      },
      textures,
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
