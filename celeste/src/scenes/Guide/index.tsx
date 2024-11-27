import { GUIView, View, Text } from "rega";

const baseTextStyle = {
  fontFamily: "celeste",
  fontSize: 6,
  letterSpacing: 2,
};

const styles = {
  row: {
    flexDirection: "row",
    marginTop: 8,
  },

  th1: { ...baseTextStyle, flexBasis: "20%" },
  th2: { ...baseTextStyle, flexBasis: "40%", textAlign: "end" },
  th3: { ...baseTextStyle, flexBasis: "40%", textAlign: "end" },

  col1: {
    ...baseTextStyle,
    flexBasis: "20%",
  },
  col2: {
    ...baseTextStyle,
    flexBasis: "40%",
    textAlign: "end",
  },
  col3: {
    ...baseTextStyle,
    flexBasis: "40%",
    textAlign: "end",
  },
} as const;

const rows = [
  ["jump", "c", "b"],
  ["dash", "x", "a"],
  ["save", "j", "lb"],
  ["load", "k", "rb"],
];

export default function Guide() {
  return (
    <GUIView>
      <View
        style={{
          backgroundColor: "rgba(255, 255, 255, 0.1)",
          marginLeft: 12,
          marginTop: 12,
          padding: 12,
          width: 180,
        }}
      >
        <View style={{ flexDirection: "row" }}>
          <Text style={styles.th1}> </Text>
          <Text style={styles.th2}>keyboard</Text>
          <Text style={styles.th3}>joystick</Text>
        </View>
        {rows.map((row, i) => (
          <View key={i} style={styles.row}>
            <Text style={styles.col1}>{row[0]}</Text>
            <Text style={styles.col2}>{row[1]}</Text>
            <Text style={styles.col3}>{row[2]}</Text>
          </View>
        ))}
      </View>
    </GUIView>
  );
}
