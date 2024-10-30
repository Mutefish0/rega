import React, { useMemo, useEffect } from "react";
import useUniforms from "../hooks/useUniforms";
import { PlaneGeometry, DataTexture, Vector2, Vector4 } from "three/webgpu";
import {
  uniform,
  float,
  positionGeometry,
  MeshBasicNodeMaterial,
  uv,
  varying,
  vec3,
  texture as texture2D,
  mod,
  int,
  round,
  vec2,
  tslFn,
  If,
  Discard,
  vec4,
} from "three/webgpu";
import TextureManager from "../common/texture_manager";
import Mesh from "../primitives/Mesh";
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

export default React.memo(function Tilemap({
  textureId,
  pixelPerTile,
  coords,
  tiles,
  tileSize = 1,
  color,
}: Props) {
  const texture = useMemo(() => TextureManager.get(textureId)!, [textureId]);

  const rects = useMemo(
    () => coords.map(([x, y]) => [x, texture!.image.height - y - pixelPerTile]),
    [coords, pixelPerTile, texture!.image.height]
  );

  const uniforms = useUniforms(
    {
      gridSize: uniform(new Vector2()),
      tex: texture2D(texture),
      dataTexture: texture2D(new DataTexture()),
      textureSize: uniform(new Vector2()),
      pixelPerTile: uniform(1),
      color: uniform(new Vector4(1, 1, 1, 1)),
    },
    () => ({ pixelPerTile }),
    [pixelPerTile]
  );

  useUniforms(
    uniforms,
    () => ({
      tex: texture,
      textureSize: new Vector2(texture.image.width, texture.image.height),
    }),
    [texture]
  );

  useUniforms(
    uniforms,
    function () {
      let width = 0;
      let height = 0;

      const normalizedTiles = tiles.map(([x, y]) => [
        x / tileSize,
        y / tileSize,
      ]);

      for (let [x, y] of normalizedTiles) {
        width = Math.max(width, Math.abs(x > 0 ? x + 1 : x) * 2);
        height = Math.max(height, Math.abs(y > 0 ? y + 1 : y) * 2);
      }

      const data = new Uint8Array(width * height * 4).fill(255);

      for (let i = 0; i < normalizedTiles.length; i++) {
        const [_x, _y] = normalizedTiles[i];
        const rect = rects[i];
        const x = _x + width / 2;
        const y = _y + height / 2;
        const r = rect[0] >> 8;
        const g = rect[0] & 0xff;
        const b = rect[1] >> 8;
        const a = rect[1] & 0xff;
        const stride = (y * width + x) * 4;
        data[stride] = r;
        data[stride + 1] = g;
        data[stride + 2] = b;
        data[stride + 3] = a;
      }

      const dataTexture = new DataTexture(data, width, height);
      dataTexture.needsUpdate = true;

      return {
        dataTexture,
        gridSize: new Vector2(width, height),
      };
    },
    [tiles, rects]
  );

  useUniforms(
    uniforms,
    () => {
      if (color) {
        const { opacity, array } = parseColor(color || "#ffffff");
        return {
          color: new Vector4(...array, opacity),
        };
      } else {
        return {
          color: new Vector4(1, 1, 1, 1),
        };
      }
    },
    [color]
  );

  const { geometry, material } = useMemo(() => {
    const geometry = new PlaneGeometry(tileSize, tileSize);
    const material = new MeshBasicNodeMaterial();
    material.transparent = true;

    material.positionNode = positionGeometry.mul(
      vec3(uniforms.gridSize.x, uniforms.gridSize.y, 1)
    );

    const vUv = varying(uv());

    uniforms.dataTexture.uvNode = vUv;

    const offsetX = float(mod(vUv.x.mul(float(uniforms.gridSize.x)), 1.0));

    const offsetY = float(mod(vUv.y.mul(float(uniforms.gridSize.y)), 1.0));

    const tx1 = int(round(uniforms.dataTexture.r.mul(255.0)));
    const tx2 = int(round(uniforms.dataTexture.g.mul(255.0)));
    const ty1 = int(round(uniforms.dataTexture.b.mul(255.0)));
    const ty2 = int(round(uniforms.dataTexture.a.mul(255.0)));

    const tx = int(tx1.mul(int(256)).add(tx2)).toVar();
    const ty = int(ty1.mul(int(256)).add(ty2)).toVar();

    const px = float(
      float(tx)
        .add(offsetX.mul(float(pixelPerTile)))
        .div(float(uniforms.textureSize.x))
    );

    const py = float(
      float(ty)
        .add(offsetY.mul(float(pixelPerTile)))
        .div(float(uniforms.textureSize.y))
    );

    const tuv = vec2(px, py);

    uniforms.tex.uvNode = tuv;

    const cnode = tslFn(() => {
      const cNode = vec4(1, 1, 1, 1).toVar();

      If(
        tx
          .lessThan(uniforms.textureSize.x)
          .and(ty.lessThan(uniforms.textureSize.y)),
        () => {
          cNode.assign(uniforms.tex, 1);
        }
      ).else(() => {
        Discard(true);
      });

      return cNode.mul(uniforms.color);
    });

    material.colorNode = cnode();

    return {
      geometry,
      material,
    };
  }, []);

  return <Mesh geometry={geometry} material={material} />;
});
