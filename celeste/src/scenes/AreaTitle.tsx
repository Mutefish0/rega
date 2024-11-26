import {} from "react";
import { View, Text } from "rega";

interface Props {
  level: number;
}

export default function AreaTitle({ level }: Props) {
  return (
    <View
      style={{
        width: 128,
        height: 128,
        flexDirection: "row",
        alignItems: "center",
      }}
    >
      <View
        style={{
          backgroundColor: "rgba(255,255,255,0.2)",
          marginLeft: "auto",
          marginRight: "auto",
        }}
      >
        <Text
          style={{
            fontFamily: "celeste",
            color: "#fff",
            fontSize: 8,
          }}
        >
          {level + 1}
        </Text>
      </View>
    </View>
  );
}
