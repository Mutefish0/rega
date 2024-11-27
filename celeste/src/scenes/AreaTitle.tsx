import { useEffect, useMemo, useState } from "react";
import { View, Text } from "rega";
import { formatTimeDuration } from "./utils";

interface Props {
  startTime: number;
  level: number;
}

const baseTextStyle = {
  fontFamily: "celeste",
  color: "#fff",
  fontSize: 5,
  letterSpacing: 1,
};

export default function AreaTitle({ level, startTime }: Props) {
  const [show, setShow] = useState(false);

  const time = useMemo(
    () => formatTimeDuration(Date.now() - startTime),
    [startTime]
  );

  useEffect(() => {
    setShow(true);
    const tmo = setTimeout(() => setShow(false), 2000);
    return () => clearTimeout(tmo);
  }, [level]);

  if (!show) {
    return null;
  }

  const title =
    level === 11
      ? "old site"
      : level === 30
      ? "summit"
      : `${(level + 1) * 100} m`;

  return (
    <View
      style={{
        width: 128,
        height: 128,
        flexDirection: "row",
        alignItems: "center",
        position: "relative",
      }}
    >
      <View
        style={{
          top: 4,
          left: 4,
          position: "absolute",
          backgroundColor: "rgba(0,0,0,0.85)",
          marginLeft: "auto",
          marginRight: "auto",
          padding: 1,
        }}
      >
        <Text style={baseTextStyle}>{time}</Text>
      </View>

      <View
        style={{
          paddingTop: 4,
          paddingBottom: 4,
          width: 80,
          backgroundColor: "rgba(0,0,0,0.85)",
          marginLeft: "auto",
          marginRight: "auto",
          padding: 1,
          justifyContent: "center",
          flexDirection: "row",
        }}
      >
        <Text style={baseTextStyle}>{title}</Text>
      </View>
    </View>
  );
}
