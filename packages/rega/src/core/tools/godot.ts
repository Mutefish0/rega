import { toInt16 } from "../math/integer";

export function parseGodotTileData(tileData: number[]) {
  const coords: Array<[number, number]> = [];
  const coord2Index: Record<string, number> = {};
  const tiles: Array<[number, number, number]> = [];

  for (let i = 0; i < tileData.length; i += 3) {
    const d1 = tileData[i]; // x, y
    const d2 = tileData[i + 1]; //  source_id, coord_x
    const d3 = tileData[i + 2]; // coord_y, alternative_tile

    const y = toInt16((d1 >> 16) & 0xffff);
    const x = toInt16(d1 & 0xffff);

    const [coordX, sourceId] = [d2 >> 16, d2 & 0xff];
    const [alternativeTile, coordY] = [d3 >> 16, d3 & 0xff];
    const key = `${coordX}:${coordY}`;
    if (!coord2Index[key]) {
      coord2Index[key] = coords.length;
      coords.push([coordX * 16, coordY * 16]);
    }

    tiles.push([x, -y - 1, coord2Index[key]]);
  }

  return {
    coords,
    tiles,
  };
}
