import { useMemo } from "react";
import { Box2D, Relative, RigidBody2D } from "rega";
import { times } from "lodash";

export default function Clouds() {
  const clouds = useMemo(
    () =>
      times(17).map(() => {
        const width = 32 + Math.random() * 32;
        const height = 4 + (1 - width / 64) * 12;
        return {
          speed: 40 + Math.random() * 80,
          x: Math.random() * 128,
          y: -Math.random() * 128,
          width,
          height,
        };
      }, []),
    []
  );

  return (
    <>
      {clouds.map((cloud, i) => (
        <Relative key={i} translation={{ x: cloud.x, y: cloud.y }}>
          <RigidBody2D
            type="kinematic-velocity"
            initialVelocity={{ x: cloud.speed, y: 0 }}
            onUpdate={(rb) => {
              if (rb.position.x > 128) {
                rb.commitPosition({ x: -cloud.width, y: -Math.random() * 128 });
              }
            }}
          >
            <Box2D
              anchor="top-left"
              size={[cloud.width, cloud.height]}
              color="#1d2b53"
            />
          </RigidBody2D>
        </Relative>
      ))}
    </>
  );
}
