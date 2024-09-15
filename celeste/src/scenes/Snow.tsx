import { useMemo } from "react";
import { Box2D, Relative, RigidBody2D } from "rega";
import { times } from "lodash";

export default function Snow() {
  const clouds = useMemo(
    () =>
      times(25).map(() => {
        const speed = 0.25 + Math.random() * 5;
        const yt = 60 / Math.min(0.08, speed / 32);
        const ot = Math.random() * 750;

        return {
          speed: speed * 30,
          x: Math.random() * 128,
          y: -Math.random() * 128,
          size: Math.random() > 0.8 ? 2 : 1,
          color: Math.random() > 0.5 ? "#fff1e8" : "#c2c3c7",
          yt,
          ot,
        };
      }, []),
    []
  );

  return (
    <>
      {clouds.map((snow, i) => (
        <Relative key={i} translation={{ x: snow.x, y: snow.y }}>
          <RigidBody2D
            type="kinematic-velocity"
            initialVelocity={{ x: snow.speed, y: 0 }}
            onUpdate={(rb, _, time) => {
              rb.commitVelocity({
                y: Math.sin(((time + snow.ot) / snow.yt) * 2 * Math.PI) * 20,
              });
              if (rb.position.x > 128) {
                rb.commitPosition({ x: -snow.size, y: -Math.random() * 128 });
              }
            }}
          >
            <Box2D
              anchor="top-left"
              size={[snow.size, snow.size]}
              color={snow.color}
            />
          </RigidBody2D>
        </Relative>
      ))}
    </>
  );
}
