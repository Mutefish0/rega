import Color from "color";

export function parseColor(c: string) {
  try {
    const cc = new Color(c);
    const opacity = cc.alpha();
    const colorArr = cc
      .rgb()
      .array()
      .slice(0, 3)
      .map((c) => c / 255) as [number, number, number];

    return {
      array: colorArr,
      opacity,
    };
  } catch (e) {
    console.warn(`Unable to parse color from string: '${c}'`);

    return {
      array: [0, 0, 0],
      opacity: 0,
    };
  }
}
