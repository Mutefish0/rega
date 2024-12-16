import { useContext, useEffect, useMemo } from "react";
import TransformContext from "./TransformContext";
import RenderContext from "./RenderContext";
import { ZIndexContext } from "./ZIndex";
import { RenderGroupContext } from "./RenderGroup";
import { BindingContext } from "./BindingLayer";
import {
  MaterialJSON,
  TransferBinding,
  TransferResource,
  TransferTextureResource,
} from "../render";
import { createVertexControll } from "../render/vertex";
import useBindings from "../hooks/useBingdings";
import { SlotGroup, getOrcreateSlot } from "../render/slot";
import createMaterial from "../render/createMaterial";
import TextureManager, { Texture } from "../common/texture_manager";
import { RenderPipelineContext } from "./RenderPipeline";
import {
  Node,
  vec3,
  float,
  vec4,
  positionGeometry,
  normalGeometry,
  zIndexBias,
  modelWorldMatrix,
  modelWorldMatrixInverse,
  normalize,
} from "pure3";
import { TransferObject } from "../render";

interface Props {
  bindings?: Record<string, TransferResource>;

  positionNode?: Node<"vec4">;
  colorNode: Node<"vec3">;
  normalNode?: Node<"vec3">;

  material?: {
    opacity?: Node<"float">;
    roughness?: Node<"float">;
    metallic?: Node<"float">;
  };

  vertexCount: number;
  vertex: Record<string, SharedArrayBuffer>;

  index?: {
    indexCount: number;
    indexBuffer: SharedArrayBuffer;
  };

  zIndexEnabled?: boolean;

  topology?: GPUPrimitiveTopology;
  cullMode?: GPUCullMode;
  depthWriteEnabled?: boolean;
}

export default function RenderObject({
  positionNode = vec4(positionGeometry, 1),
  normalNode = normalGeometry,
  colorNode,

  material,

  vertex,
  vertexCount,
  index,
  bindings = {},
  zIndexEnabled,
  topology,
  cullMode,
  depthWriteEnabled,
}: Props) {
  const id = useMemo(() => crypto.randomUUID(), []);
  const pipelineCtx = useContext(RenderPipelineContext);
  const zIndexCtx = useContext(ZIndexContext);
  const rgCtx = useContext(RenderGroupContext);
  const renderCtx = useContext(RenderContext);
  const transform = useContext(TransformContext);
  const bindingCtx = useContext(BindingContext);

  const vc = useMemo(() => createVertexControll(vertexCount), []);

  const binds = useBindings({
    modelWorldMatrix: "mat4",
    modelWorldMatrixInverse: "mat4",
    zIndex: "float",
  });

  const allBindingResources = useMemo(
    () => ({
      ...bindingCtx.resources,
      ...bindings,
      ...binds.resources,
    }),
    [bindings, binds.resources]
  );

  useEffect(() => {
    vc.updateVertexCount(vertexCount);
  }, [vertexCount]);

  const materials = useMemo(() => {
    const passes = pipelineCtx.groupToPass[rgCtx.id];
    const materials: Record<string, MaterialJSON> = {};

    const objectSlotGroup: SlotGroup = {
      map: {},
      maxSlot: 0,
    };

    function getBindingLayout(name: string) {
      if (bindings[name] || binds.resources[name]) {
        return {
          group: 0,
          binding: getOrcreateSlot(objectSlotGroup, name),
        };
      } else {
        return {
          group: 1,
          binding: bindingCtx.bindingPoints[name],
        };
      }
    }

    const vertexSlotGroup: SlotGroup = { map: {}, maxSlot: 0 };

    function getAttributeLayout(name: string) {
      return getOrcreateSlot(vertexSlotGroup, name);
    }

    const p = modelWorldMatrix.mul(positionNode);
    const n = normalize(
      modelWorldMatrixInverse.transpose().mul(vec4(normalNode, 0)).xyz
    );

    for (const pass of passes) {
      const { position, color } = pass.pipeline({
        position: p,
        normal: n,
        color: colorNode,

        metallic: material?.metallic ?? float(0),
        roughness: material?.roughness ?? float(0),

        lightDir: vec3(0, 0, 1),
        lightColor: vec3(1, 1, 1),
        ambientColor: vec3(0, 0, 0),
      });

      let vertex = position!;
      if (zIndexEnabled) {
        vertex = vertex.add(zIndexBias);
        vertex.uuid = position!.uuid + "-zIndexEnabled";
      }

      materials[pass.id] = createMaterial(
        vertex,
        vec4(color!, material?.opacity ?? float(1)),
        getBindingLayout,
        getAttributeLayout,
        {
          topology,
          cullMode,
          depthWriteEnabled,
        }
      );
    }

    return materials;
  }, [
    positionNode,
    normalNode,
    colorNode,
    zIndexEnabled,
    material?.metallic,
    material?.roughness,
  ]);

  useEffect(() => {
    const mat = transform.leafMatrix;
    binds.updates.modelWorldMatrix(mat.elements);
    binds.updates.modelWorldMatrixInverse(mat.invert().elements);
  }, [transform]);

  useEffect(() => binds.updates.zIndex([zIndexCtx.node.zValue]), [zIndexCtx]);

  useEffect(() => {
    const textures: Record<string, Texture> = {};

    const vertexBuffers: Record<
      string,
      {
        buffer: SharedArrayBuffer;
        binding: number;
      }
    > = {};

    const passes: Record<
      string,
      {
        material: MaterialJSON;
        bindingGroups: Array<TransferBinding[]>;
      }
    > = {};

    for (const passId in materials) {
      const material = materials[passId];

      const transferBindingGroups: TransferBinding[][] = [];

      for (const bindGroup of material.bindGroups) {
        const transferBindings: TransferBinding[] = [];
        for (const layout of bindGroup) {
          const name = layout.name;
          const resource = allBindingResources[name];
          if (resource) {
            transferBindings.push({
              name,
              binding: layout.binding,
              resource,
              visibility: layout.visibility,
            });
          } else {
            if (layout.type === "sampler") {
              transferBindings.push({
                name,
                binding: layout.binding,
                resource: {
                  type: "sampler",
                  magFilter: "nearest",
                  minFilter: "nearest",
                },
                visibility: layout.visibility,
              });
            } else {
              throw new Error(`Missing binding ${name}`);
            }
          }
          if (
            ["sampledTexture", "sintTexture", "uintTexture"].includes(
              layout.type
            )
          ) {
            const res = allBindingResources[
              layout.name
            ] as TransferTextureResource;
            const texture = TextureManager.get(res.textureId);
            if (!texture) {
              throw new Error(`Missing texture ${res.textureId}`);
            }
            textures[layout.name] = texture;
          }
        }
        transferBindingGroups.push(transferBindings);
      }

      for (const attr of material.attributes) {
        const attributeName = attr.name;
        if (!vertexBuffers[attributeName]) {
          const buffer = vertex[attributeName];
          if (!buffer) {
            throw new Error(`Missing attribute ${attributeName}`);
          }
          vertexBuffers[attributeName] = {
            binding: attr.binding,
            buffer,
          };
        }
      }

      passes[passId] = {
        material,
        bindingGroups: transferBindingGroups,
      };
    }

    const object: TransferObject = {
      id,
      groupId: rgCtx.id,
      passes,
      textures,
      input: {
        vertexBuffers,
        vertexCtrlBuffer: vc.buffer,
        index,
      },
    };

    renderCtx.server.createObject(object);

    return () => {
      renderCtx.server.removeObject(id);
    };
  }, []);

  return null;
}
