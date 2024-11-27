import { ShapeCollider2D, Relative, Vector } from "rega";
import { CollisionGroup } from "../../constants";

interface Props {
  dir: number; // 1-top 2-bottom 3-left 4-right
}

export default function Spike({ dir }: Props) {
  let size: [number, number] = [8, 3];

  let trans = { x: 0, y: 0 };

  if (dir === 3 || dir === 4) {
    size = [5, 8];
  }

  if (dir === 1) {
    trans = {
      x: -1,
      y: -3,
    };
  } else if (dir === 2) {
    trans = { x: 0, y: 1 };
  } else if (dir === 3) {
    trans = { x: 6, y: 0 };
  } else if (dir === 4) {
    trans = { x: -3, y: 0 };
  }

  return (
    <Relative translation={trans}>
      <ShapeCollider2D
        anchor="top-left"
        shape="cuboid"
        size={size}
        userData={{ type: "spike", dir }}
        collisionGroup={CollisionGroup.Sensor}
        collisionMask={CollisionGroup.Player}
      />
    </Relative>
  );
}
