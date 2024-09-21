/** BMP */
export default class BMPFont {
  public textureId: string;
  public aspectRatio: number;

  private charSize: [number, number];
  private clipMap: Record<number, [number, number, number, number]>;

  constructor(textureId: string, charSize: [number, number]) {
    this.textureId = textureId;
    this.charSize = [...charSize];
    this.aspectRatio = charSize[0] / charSize[1];
    this.clipMap = {};
  }

  getClip(code: number): [number, number, number, number] {
    if (!this.clipMap[code]) {
      const y = Math.floor(code / 16);
      const x = code % 16;
      this.clipMap[code] = [
        x * this.charSize[0],
        y * this.charSize[1],
        this.charSize[0],
        this.charSize[1],
      ];
    }
    return this.clipMap[code];
  }
}
