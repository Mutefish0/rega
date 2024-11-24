import { useRef, useState } from "react";
import Text, { TextStyle } from "./UI/Text";
import View from "./UI/View";
import useFrame from "../hooks/useFrame";

interface Props {
  style: TextStyle;
}

export default function FPS({ style }: Props) {
  const [fps, setFps] = useState(0);
  const frames = useRef(0);
  const timeElapsed = useRef(0);

  useFrame((deltaTime) => {
    timeElapsed.current += deltaTime;
    frames.current += 1;
    if (timeElapsed.current >= 1000) {
      setFps(frames.current);
      timeElapsed.current -= 1000;
      frames.current = 0;
    }
  }, []);

  return (
    <View style={{ flexDirection: "row" }}>
      <Text style={style}>{`FPS ${fps}`}</Text>
    </View>
  );
}
