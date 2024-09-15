export default class BMPFont {
  textureId: string;
  aspectRatio: number;
  private clipMap: Record<number, [number, number, number, number]>;
  constructor(
    textureId: string,
    charSize: [number, number],
    charCodeRange: [number, number]
  ) {
    this.textureId = textureId;
    this.aspectRatio = charSize[0] / charSize[1];
    this.clipMap = {};
    for (let i = charCodeRange[0]; i < charCodeRange[1]; i++) {
      const y = Math.floor(i / 16);
      const x = i % 16;
      this.clipMap[i] = [
        x * charSize[0],
        y * charSize[1],
        charSize[0],
        charSize[1],
      ];
    }
  }

  getClip(code: number): [number, number, number, number] | undefined {
    return this.clipMap[code];
  }
}
