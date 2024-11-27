import { GUIView, Text } from "rega";

export default function Toast({ children }: { children: string }) {
  return (
    <GUIView>
      <Text
        style={{
          position: "absolute",
          left: 12,
          bottom: 12,
          fontFamily: "celeste",
          fontSize: 14,
          lineHeight: 24,
          color: "#fff",
          letterSpacing: 4,
          paddingLeft: 8,
          paddingRight: 8,
          backgroundColor: "rgba(0,0,0,0.85)",
        }}
      >
        {children}
      </Text>
    </GUIView>
  );
}
