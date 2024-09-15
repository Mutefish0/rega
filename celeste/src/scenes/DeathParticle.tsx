import { Box2D, RigidBody2D, Animation, Relative } from "rega";
import { times } from "lodash";

const animConfig = {
  steps: times(10, (i) => ({
    size: (2 * (10 - i)) / 5,
    color: i % 2 === 0 ? "#ff77a8" : "#ffccaa",
  })),
  duration: 400,
};

export default function DeathParticle() {
  return (
    <>
      {times(8, (i) => {
        const vx = Math.cos((i / 8) * Math.PI * 2) * 90;
        const vy = Math.sin((i / 8) * Math.PI * 2) * 90;

        const dx = vx * 0.05;
        const dy = vy * 0.05;

        return (
          <Relative key={i} translation={{ x: dx, y: dy }}>
            <RigidBody2D
              type="kinematic-velocity"
              initialVelocity={{
                x: Math.cos((i / 8) * Math.PI * 2) * 90,
                y: Math.sin((i / 8) * Math.PI * 2) * 90,
              }}
            >
              <Animation
                config={animConfig}
                renderItem={({ size, color }) => (
                  <Box2D size={[size, size]} color={color} />
                )}
              />
            </RigidBody2D>
          </Relative>
        );
      })}
    </>
  );
}
