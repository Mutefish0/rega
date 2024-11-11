import React, { useMemo, useEffect } from "react";
import RenderObject from "../primitives/RenderObject";

import {
  uv,
  varying,
  int,
  round,
  tslFn,
  If,
  Discard,
  mod,
  texture,
  uniform,
  float,
  positionGeometry,
  vec2,
  vec4,
  modelWorldMatrix,
  cameraProjectionMatrix,
  cameraViewMatrix,
  dataTexture,
} from "pure3";

import TextureManager from "../common/texture_manager";
import quad from "../render/geometry/quad";
import useBindings from "../hooks/useBingdings";
import useTextureBinding from "../hooks/useTextureBinding";

import { parseColor } from "../tools/color";

interface Props {
  textureId: string;
  pixelPerTile: number;
  /* sprite coord, top-left anchor */
  coords: Array<[number, number]>;
  /* tile coord, bottom-left anchor */
  tiles: Array<[number, number]>; // [x, y]
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
  .mul(vec4(positionGeometry.xy.mul(gridSize), positionGeometry.z, 1));

const fragmentNode = (function () {
  const vUv = varying(uv());

  const offsetX = float(mod(vUv.x.mul(float(gridSize.x)), 1.0));
  const offsetY = float(mod(vUv.y.mul(float(gridSize.y)), 1.0));

  const dUv = vec2(offsetX, offsetY);

  return vec4(dUv.x, dUv.y, 0, 1);

  dataTex.uvNode = dUv;

  const tx1 = dataTex.r;
  const tx2 = dataTex.g;
  const ty1 = dataTex.b;
  const ty2 = dataTex.a;

  const tx = int(tx1.mul(int(256)).add(tx2)).toVar();
  const ty = int(ty1.mul(int(256)).add(ty2)).toVar();

  const px = float(
    float(tx)
      .add(offsetX.mul(float(pixelPerTile)))
      .div(float(texSize.x))
  );
  const py = float(
    float(ty)
      .add(offsetY.mul(float(pixelPerTile)))
      .div(float(texSize.y))
  );

  const tuv = vec2(px, py);

  tex.uvNode = tuv;

  const cnode = tslFn(() => {
    const cNode = vec4(1, 1, 1, 1).toVar();
    If(tx.lessThan(texSize.x).and(ty.lessThan(texSize.y)), () => {
      cNode.assign(tex, 1);
    }).else(() => {
      Discard(true);
    });
    return cNode.mul(color);
  });

  return cnode();
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

  const rects = useMemo(
    () => coords.map(([x, y]) => [x, texture!.height - y - pixelPerTile]),
    [coords, pixelPerTile, texture!.height]
  );

  useEffect(() => {
    let width = 0;
    let height = 0;

    const normalizedTiles = tiles.map(([x, y]) => [x / tileSize, y / tileSize]);

    for (let [x, y] of normalizedTiles) {
      width = Math.max(width, Math.abs(x > 0 ? x + 1 : x) * 2);
      height = Math.max(height, Math.abs(y > 0 ? y + 1 : y) * 2);
    }

    const data: Record<string, number[]> = {};

    for (let i = 0; i < normalizedTiles.length; i++) {
      const [_x, _y] = normalizedTiles[i];
      const rect = rects[i];
      const x = _x + width / 2;
      const y = _y + height / 2;
      const r = rect[0] >> 8;
      const g = rect[0] & 0xff;
      const b = rect[1] >> 8;
      const a = rect[1] & 0xff;

      data[`${x}-${y}`] = [r, g, b, a];
    }

    dataTextureBinding.update([0, 0, width, height], (x, y) => {
      return data[`${x}-${y}`] || [0, 0, 0, 0];
    });

    bindings.updates.gridSize([width, height]);
  }, [tiles, rects]);

  useEffect(() => {
    if (color) {
      const { opacity, array } = parseColor(color || "#ffffff");
      bindings.updates.color([...array, opacity]);
    } else {
      bindings.updates.color([1, 1, 1, 1]);
    }
  }, [color]);

  // const { geometry, material } = useMemo(() => {
  //   const geometry = new PlaneGeometry(tileSize, tileSize);
  //   const material = new MeshBasicNodeMaterial();
  //   material.transparent = true;

  //   material.positionNode = positionGeometry.mul(
  //     vec3(uniforms.gridSize.x, uniforms.gridSize.y, 1)
  //   );

  //   const vUv = varying(uv());

  //   uniforms.dataTexture.uvNode = vUv;

  //   const offsetX = float(mod(vUv.x.mul(float(uniforms.gridSize.x)), 1.0));

  //   const offsetY = float(mod(vUv.y.mul(float(uniforms.gridSize.y)), 1.0));

  //   const tx1 = int(round(uniforms.dataTexture.r.mul(255.0)));
  //   const tx2 = int(round(uniforms.dataTexture.g.mul(255.0)));
  //   const ty1 = int(round(uniforms.dataTexture.b.mul(255.0)));
  //   const ty2 = int(round(uniforms.dataTexture.a.mul(255.0)));

  //   const tx = int(tx1.mul(int(256)).add(tx2)).toVar();
  //   const ty = int(ty1.mul(int(256)).add(ty2)).toVar();

  //   const px = float(
  //     float(tx)
  //       .add(offsetX.mul(float(pixelPerTile)))
  //       .div(float(uniforms.textureSize.x))
  //   );

  //   const py = float(
  //     float(ty)
  //       .add(offsetY.mul(float(pixelPerTile)))
  //       .div(float(uniforms.textureSize.y))
  //   );

  //   const tuv = vec2(px, py);

  //   uniforms.tex.uvNode = tuv;

  //   const cnode = tslFn(() => {
  //     const cNode = vec4(1, 1, 1, 1).toVar();

  //     If(
  //       tx
  //         .lessThan(uniforms.textureSize.x)
  //         .and(ty.lessThan(uniforms.textureSize.y)),
  //       () => {
  //         cNode.assign(uniforms.tex, 1);
  //       }
  //     ).else(() => {
  //       Discard(true);
  //     });

  //     return cNode.mul(uniforms.color);
  //   });

  //   material.colorNode = cnode();

  //   return {
  //     geometry,
  //     material,
  //   };
  // }, []);

  return (
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
    />
  );
});
