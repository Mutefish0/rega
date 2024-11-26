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
  fontSize: 12,
};

export default function Scoreboard({ deaths, startTime, fruitsGot }: Props) {
  const timeDaration = useMemo(
    () => formatTimeDuration(Date.now() - startTime),
    [startTime]
  );

  return (
    <View>
      <View>
        <Text style={textStyle}>x{fruitsGot}</Text>
      </View>
      <View>
        <Text style={textStyle}>{timeDaration}</Text>
      </View>
      <View>
        <Text style={textStyle}>Deaths: {deaths}</Text>
      </View>
    </View>
  );
}
