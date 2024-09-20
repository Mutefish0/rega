/** Typeface font */
import { BufferGeometry } from "three/webgpu";

export interface GlyphData {
  ha: number;
  x_min: number;
  x_max: number;
  o: string;
}

interface BoundingBox {
  yMin: number;
  xMin: number;
  yMax: number;
  xMax: number;
}

export interface TypefaceData {
  glyphs: Record<string, GlyphData>;
  ascender: number;
  descender: number;
  underlinePosition: number;
  underlineThickness: number;
  boundingBox: BoundingBox;
  resolution: number;
  cssFontWeight: "normal" | "bold" | "lighter";
  cssFontStyle: "normal" | "italic";
}

export default class TFFont {
  public ascender: number;
  public descender: number;
  public boundingBox: BoundingBox;
  public resolution: number;
  public fontSize: number;

  private glyphs: Record<string, GlyphData>;
  private glyphCache: Record<string, BufferGeometry>;

  constructor(data: TypefaceData) {
    this.resolution = data.resolution;
    this.ascender = data.ascender;
    this.descender = data.descender;
    this.boundingBox = data.boundingBox;
    this.glyphs = data.glyphs;
    this.glyphCache = {};
    this.fontSize = this.ascender - this.descender;
  }

  public getGlyph(char: string): GlyphData | undefined {
    return this.glyphs[char];
  }

  public getGeometry(char: string): BufferGeometry | undefined {
    if (!this.glyphCache[char]) {
      // TODO
    }
    return this.glyphCache[char];
  }
}
