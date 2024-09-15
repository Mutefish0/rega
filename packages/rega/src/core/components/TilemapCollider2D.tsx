import { useMemo } from "react";
import { NeighborMaskBoard } from "../tools/tilemap";
import ConvexCollider2D from "./ConvexCollider2D";

interface Props {
  tiles: Array<[number, number] | [number, number, number]>; // [x, y, tileIndex]
  userData?: any;
  collisionGroup?: number;
  collisionMask?: number;
  tileSize?: number;
}

export default function TilemapCollider2D({
  tiles,
  userData,
  collisionGroup,
  collisionMask,
  tileSize = 1,
}: Props) {
  const { verticsList } = useMemo(() => {
    const board = new NeighborMaskBoard(
      tiles.map(([x, y]) => [x / tileSize, y / tileSize])
    );
    const verticsList = board
      .getVertics()
      .map((vs) =>
        vs.map(([x, y]) => [x * tileSize, y * tileSize] as [number, number])
      );
    return {
      verticsList,
    };
  }, [tiles]);

  // fix inner edge collision
  function modifySolverContacts(norm: [number, number]) {
    if (norm[1] > 0.99) {
      return false;
    }
    return true;
  }

  return verticsList.map((vertics) => (
    <ConvexCollider2D
      key={vertics[0].join(",")}
      points={vertics}
      type="polyline"
      userData={userData}
      modifySolverContacts={modifySolverContacts}
      collisionGroup={collisionGroup}
      collisionMask={collisionMask}
    />
  ));
}
