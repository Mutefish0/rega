import React, { useMemo, useEffect } from "react";
import RenderObject from "../primitives/RenderObject";

import {
  Fn,
  uv,
  floor,
  uint,
  tslFn,
  If,
  Discard,
  mod,
  texture,
  uniform,
  float,
  positionGeometry,
  uvec2,
  vec2,
  vec4,
  modelWorldMatrix,
  cameraProjectionMatrix,
  cameraViewMatrix,
  dataTexture,
  Matrix4,
} from "pure3";

import Relative from "../primitives/Relative";
import TextureManager from "../common/texture_manager";
import quad from "../render/geometry/quad";
import useBindings from "../hooks/useBingdings";
import useTextureBinding from "../hooks/useTextureBinding";

import { parseColor } from "../tools/color";

interface Props {
  textureId: string;
  /* sprite pixel size per tile */
  pixelPerTile: number;
  /* sprite coord, top-left anchor */
  coords: Array<[number, number]>;
  /* tile coord, top-left anchor */
  tiles: Array<[number, number]>; // [x, y]
  /* world size per tile */
  tileSize?: number;

  color?: string;
}

const gridSize = uniform("vec2", "gridSize");
const tex = texture("tex");
const texSize = uniform("vec2", "texSize");
const dataTex = dataTexture("rgba8uint", "dataTex");
// const dataTexSize = uniform("vec2", "dataTexSize");
const pixelPerTile = uniform("float", "pixelPerTile");
const color = uniform("vec4", "color");

const vertexNode = cameraProjectionMatrix
  .mul(cameraViewMatrix)
  .mul(modelWorldMatrix)
  .mul(vec4(positionGeometry, 1));

const transparentDiscard = Fn(({ color }: any) => {
  const result = color.toVar();

  If(color.a.lessThanEqual(0.0), () => {
    Discard();
  });

  return result;
});

const fragmentNode = (function () {
  const uvNode = uv();

  const offsetX = float(mod(uvNode.x.mul(float(gridSize.x)), 1.0));
  const offsetY = float(mod(uvNode.y.mul(float(gridSize.y)), 1.0));

  dataTex.uvNode = uvec2(floor(uvNode.mul(gridSize)));

  const tx1 = dataTex.r;
  const tx2 = dataTex.g;
  const ty1 = dataTex.b;
  const ty2 = dataTex.a;

  const tx = tx1.mul(uint(256)).add(tx2).toVar();
  const ty = ty1.mul(uint(256)).add(ty2).toVar();

  tex.uvNode = vec2(
    float(float(tx).add(offsetX.mul(pixelPerTile))).div(texSize.x),
    float(float(ty).add(offsetY.mul(pixelPerTile))).div(texSize.y)
  );

  const cnode = tslFn(() => {
    const cNode = vec4(1, 1, 1, 1).toVar();
    If(float(tx).lessThan(texSize.x).and(float(ty).lessThan(texSize.y)), () => {
      cNode.assign(tex, 1);
    }).else(() => {
      Discard(true);
    });
    return cNode.mul(color);
  });

  return transparentDiscard({ color: cnode() });
})();

export default React.memo(function Tilemap({
  textureId,
  pixelPerTile,
  coords,
  tiles,
  tileSize = 1,
  color,
}: Props) {
  const texture = useMemo(() => TextureManager.get(textureId)!, [textureId]);

  const dataTextureBinding = useTextureBinding("rgba8uint", 1000, 1000); // max_tile_size 1000*1000

  const bindings = useBindings(
    {
      gridSize: "vec2",
      texSize: "vec2",
      pixelPerTile: "float",
      color: "vec4",
      tex: "texture_2d",
      dataTex: "texture_2d<uint>",
    },
    (init) => {
      init.dataTex(dataTextureBinding.textureId);
      init.tex(textureId);
      init.texSize([texture.width, texture.height]);
    }
  );

  const gridSize = useMemo(() => {
    let width = 0;
    let height = 0;
    for (let [x, y] of tiles) {
      width = Math.max(width, Math.abs(x >= 0 ? x + 1 : x) * 2);
      height = Math.max(height, Math.abs(y >= 0 ? y + 1 : y - 1) * 2);
    }

    return [width, height];
  }, [tiles]);

  useEffect(() => {
    bindings.updates.gridSize(gridSize);
  }, [gridSize]);

  useEffect(() => {
    const data: Record<string, number[]> = {};

    for (let i = 0; i < tiles.length; i++) {
      const [_x, _y] = tiles[i];
      const rect = coords[i];
      // world coord to texture coord (top-left anchor)
      const x = _x + gridSize[0] / 2;
      const y = gridSize[1] / 2 - _y;
      const r = rect[0] >> 8;
      const g = rect[0] & 0xff;
      const b = rect[1] >> 8;
      const a = rect[1] & 0xff;
      data[`${x}-${y}`] = [r, g, b, a];
    }

    dataTextureBinding.update([0, 0, gridSize[0], gridSize[1]], (x, y) => {
      return data[`${x}-${y}`] || [0, -1, 0, -1];
    });
  }, [gridSize, tiles, coords]);

  useEffect(() => {
    if (color) {
      const { opacity, array } = parseColor(color || "#ffffff");
      bindings.updates.color([...array, opacity]);
    } else {
      bindings.updates.color([1, 1, 1, 1]);
    }
  }, [color]);

  useEffect(() => {
    bindings.updates.pixelPerTile([pixelPerTile]);
  }, [pixelPerTile]);

  const matrix = useMemo(() => {
    const mat = new Matrix4();
    mat.makeScale(gridSize[0] * tileSize, gridSize[1] * tileSize, 1);
    return mat;
  }, [gridSize.join(","), tileSize]);

  return (
    <Relative matrix={matrix}>
      <RenderObject
        bindings={bindings.resources}
        vertexNode={vertexNode}
        fragmentNode={fragmentNode}
        vertex={{
          position: quad.vertex.position,
          uv: quad.vertex.uv,
        }}
        vertexCount={quad.vertexCount}
        index={quad.index}
        zIndexEnabled
        depthWriteEnabled
      />
    </Relative>
  );
});
