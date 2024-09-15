import { ShapeCollider2D, Relative, Vector } from "rega";
import { CollisionGroup } from "../../constants";

interface Props {
  dir: number; // 1-top 2-bottom 3-left 4-right
  onSpike: (position: Vector) => void;
}

export default function Spike({ dir, onSpike }: Props) {
  let size: [number, number] = [7, 5];
  let trans = { x: 0, y: 0 };
  if (dir === 3 || dir === 4) {
    size = [5, 7];
  }
  if (dir === 3) {
    trans = { x: 3, y: 0 };
  } else if (dir === 4) {
    trans = { x: 0, y: -1 };
  }

  return (
    <Relative translation={trans}>
      <ShapeCollider2D
        anchor="top-left"
        shape="cuboid"
        size={size}
        userData={{ type: "spike" }}
        collisionGroup={CollisionGroup.Sensor}
        collisionMask={CollisionGroup.Player}
        onCollisionChange={(cols) => {
          const col = cols.find((col) => col?.userData?.type === "player");
          if (col) {
            onSpike(col.contactData!.solverContacts[0]);
          }
        }}
      />
    </Relative>
  );
}
