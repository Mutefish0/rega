/** Typeface font */
import { BufferGeometry, ShapePath, ExtrudeGeometry } from "three/webgpu";

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

function createGeometry(glyph: GlyphData) {
  const path = new ShapePath();

  let x, y, cpx, cpy, cpx1, cpy1, cpx2, cpy2;

  if (glyph.o) {
    const outline = glyph.o.split(" ") as any;

    for (let i = 0, l = outline.length; i < l; ) {
      const action = outline[i++];

      switch (action) {
        case "m": // moveTo
          x = +outline[i++];
          y = +outline[i++];

          path.moveTo(x, y);

          break;

        case "l": // lineTo
          x = +outline[i++];
          y = +outline[i++];

          path.lineTo(x, y);

          break;

        case "q": // quadraticCurveTo
          cpx = +outline[i++];
          cpy = +outline[i++];
          cpx1 = +outline[i++];
          cpy1 = +outline[i++];

          path.quadraticCurveTo(cpx1, cpy1, cpx, cpy);

          break;

        case "b": // bezierCurveTo
          cpx = +outline[i++];
          cpy = +outline[i++];
          cpx1 = +outline[i++];
          cpy1 = +outline[i++];
          cpx2 = +outline[i++];
          cpy2 = +outline[i++];

          path.bezierCurveTo(cpx1, cpy1, cpx2, cpy2, cpx, cpy);

          break;
      }
    }
  }

  const shapes = path.toShapes() as any;

  return new ExtrudeGeometry(shapes);
}

export default class TFFont {
  public ascender: number;
  public descender: number;
  public boundingBox: BoundingBox;
  public resolution: number;
  public fontSize: number;

  private glyphs: Record<string, GlyphData>;
  private geometries: Record<string, BufferGeometry>;

  constructor(data: TypefaceData) {
    this.resolution = data.resolution;
    this.ascender = data.ascender;
    this.descender = data.descender;
    this.boundingBox = data.boundingBox;
    this.glyphs = data.glyphs;
    this.geometries = {};
    this.fontSize = this.ascender - this.descender;
  }

  public getGlyph(char: string): GlyphData | undefined {
    return this.glyphs[char];
  }

  public getGeometry(char: string): BufferGeometry | undefined {
    if (!this.geometries[char]) {
      const glyph = this.getGlyph(char);
      if (glyph) {
        this.geometries[char] = createGeometry(glyph);
      }
    }
    return this.geometries[char];
  }
}
