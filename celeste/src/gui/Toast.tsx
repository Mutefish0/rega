import { GUIView, View, Text } from "rega";

export default function Toast({ children }: { children: string }) {
  return (
    <GUIView>
      <View
        style={{
          flexDirection: "row",
        }}
      >
        <Text
          style={{
            paddingLeft: 12,
            paddingTop: 10,
            fontFamily: "celeste",
            fontSize: 28,
            backgroundColor: "#000",
            color: "#fff",
            margin: 16,
            letterSpacing: -12,
          }}
        >
          {children}
        </Text>
      </View>
    </GUIView>
  );
}
