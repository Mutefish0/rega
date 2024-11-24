import { GUIView, View, Text } from "rega";

const baseTextStyle = {
  fontFamily: "celeste",
  fontSize: 12,
  letterSpacing: -4,
};

export default function Guide() {
  return (
    <GUIView>
      <View
        style={{
          backgroundColor: "rgba(255, 255, 255, 0.1)",
          width: 240,
          marginLeft: 12,
          marginTop: 12,
          padding: 8,
        }}
      >
        <View style={{ flexDirection: "row" }}>
          <Text style={{ ...baseTextStyle, flexBasis: "30%" }}> </Text>
          <Text style={{ ...baseTextStyle, flexBasis: "40%" }}>keyboard</Text>
          <Text style={{ ...baseTextStyle, flexBasis: "40%" }}>joystick</Text>
        </View>
        <View style={{ flexDirection: "row" }}>
          <Text style={{ ...baseTextStyle, flexBasis: "30%" }}>jump</Text>
          <Text style={{ ...baseTextStyle, flexBasis: "40%" }}>c</Text>
          <Text style={{ ...baseTextStyle, flexBasis: "40%" }}>b</Text>
        </View>
        <View style={{ flexDirection: "row" }}>
          <Text style={{ ...baseTextStyle, flexBasis: "30%" }}>dash</Text>
          <Text style={{ ...baseTextStyle, flexBasis: "40%" }}>x</Text>
          <Text style={{ ...baseTextStyle, flexBasis: "40%" }}>a</Text>
        </View>
        <View style={{ flexDirection: "row" }}>
          <Text style={{ ...baseTextStyle, flexBasis: "30%" }}>save</Text>
          <Text style={{ ...baseTextStyle, flexBasis: "40%" }}>j</Text>
          <Text style={{ ...baseTextStyle, flexBasis: "40%" }}>LB</Text>
        </View>
        <View style={{ flexDirection: "row" }}>
          <Text style={{ ...baseTextStyle, flexBasis: "30%" }}>load</Text>
          <Text style={{ ...baseTextStyle, flexBasis: "40%" }}>k</Text>
          <Text style={{ ...baseTextStyle, flexBasis: "40%" }}>RB</Text>
        </View>
      </View>
    </GUIView>
  );
}
