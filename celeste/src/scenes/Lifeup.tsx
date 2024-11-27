import { View, Text, Animation, RigidBody2D } from "rega";

const animConfig = {
  steps: ["#fff1e8", "#ff004d"],
  duration: 132,
  loop: true,
};

export default function Lifeup() {
  return (
    <RigidBody2D type="kinematic-velocity" initialVelocity={{ x: 0, y: 8 }}>
      <Animation
        config={animConfig}
        renderItem={(color) => (
          <View style={{ height: 20 }}>
            <Text
              style={{
                fontFamily: "celeste",
                fontSize: 5,
                letterSpacing: 2,
                color,
              }}
            >
              1000
            </Text>
          </View>
        )}
      />
    </RigidBody2D>
  );
}
