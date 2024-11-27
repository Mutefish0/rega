import { useMemo } from "react";
import { View, Text } from "rega";
import { formatTimeDuration } from "./utils";

interface Props {
  deaths: number;
  startTime: number;
  fruitsGot: number;
}

const textStyle = {
  fontFamily: "celeste",
  fontSize: 5,
  lineHeight: 8,
  color: "#fff",
  letterSpacing: 1,
};

export default function Scoreboard({ deaths, startTime, fruitsGot }: Props) {
  const timeDaration = useMemo(
    () => formatTimeDuration(Date.now() - startTime),
    [startTime]
  );

  return (
    <View
      style={{
        width: 128,
        height: 128,
        flexDirection: "row",
        alignItems: "flex-start",
        justifyContent: "center",
      }}
    >
      <View
        style={{
          marginTop: 2,
          width: 60,
          paddingTop: 2,
          paddingBottom: 2,
          alignItems: "center",
          backgroundColor: "rgba(0,0,0,0.85)",
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <View
            style={{
              backgroundImage: "/images/fruit.png",
              width: 7,
              height: 7,
              marginRight: 1,
            }}
          />
          <Text style={textStyle}>x{fruitsGot}</Text>
        </View>
        <Text style={textStyle}>{timeDaration}</Text>
        <Text style={textStyle}>deaths:{deaths}</Text>
      </View>
    </View>
  );
}
