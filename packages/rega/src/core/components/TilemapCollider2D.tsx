import { useMemo } from "react";
import { NeighborMaskBoard } from "../tools/tilemap";
import ConvexCollider2D from "./ConvexCollider2D";
import { AnchorType } from "../hooks/useAnchor";

interface Props {
  anchor?: AnchorType;
  tiles: Array<[number, number] | [number, number, number]>; // [x, y, tileIndex]
  userData?: any;
  collisionGroup?: number;
  collisionMask?: number;
  tileSize?: number;
}

export default function TilemapCollider2D({
  anchor = "top-left",
  tiles,
  userData,
  collisionGroup,
  collisionMask,
  tileSize = 1,
}: Props) {
  const offset = useMemo(() => {
    if (anchor === "center") {
      return [-0.5, -0.5];
    } else if (anchor === "top-left") {
      return [0, -1];
    } else if (anchor === "bottom-left") {
      return [0, 0];
    } else if (anchor === "top") {
      return [-0.5, -1];
    } else if (anchor === "bottom") {
      return [-0.5, 0];
    }
    return [0, 0];
  }, [anchor]);

  const { verticsList } = useMemo(() => {
    const board = new NeighborMaskBoard(
      tiles.map(([x, y]) => [x + offset[0], y + offset[1]])
    );

    const verticsList = board
      .getVertics()
      .map((vs) =>
        vs.map(([x, y]) => [x * tileSize, y * tileSize] as [number, number])
      );
    return {
      verticsList,
    };
  }, [tiles, offset]);

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
