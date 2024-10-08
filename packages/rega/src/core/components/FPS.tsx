import { useRef, useState } from "react";
import GUIView from "./UI/GUIView";
import Text, { TextStyle } from "./UI/Text";
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
    <GUIView>
      <Text style={style}>{`FPS ${fps}`}</Text>
    </GUIView>
  );
}
