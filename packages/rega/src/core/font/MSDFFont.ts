interface GlyphData {
  id: number;
  char: string;
  width: number;
  height: number;
  xoffset: number;
  yoffset: number;
  xadvance: number;
  chnl: number;
  x: number;
  y: number;
  page: number;
}

interface FontInfo {
  face: string;
  size: number;
  bold: 0 | 1;
  italic: 0 | 1;
}

interface FontCommon {
  lineHeight: number;
  base: number;
  scaleW: number;
  scaleH: number;
  pages: number;
  packed: 0 | 1;
  alphaChnl: 0 | 1;
  redChnl: 0 | 1;
  greenChnl: 0 | 1;
  blueChnl: 0 | 1;
}

interface Kerning {
  first: number;
  second: number;
  amount: number;
}

export interface MSDFFontData {
  pages: Array<string>;
  info: FontInfo;
  common: FontCommon;
  chars: Array<GlyphData>;
  kernings: Array<Kerning>;
}

export default class MSDFFont {
  private glyphs: Record<number, GlyphData>;
  public pages: string[];

  public fontSize: number;

  //public atlas: AtlasInfo;
  //public metrics: Metrics;

  constructor(pages: string[], data: MSDFFontData) {
    this.pages = pages;
    this.fontSize = data.info.size;
    this.glyphs = {};
    data.chars.forEach((glyph) => {
      this.glyphs[glyph.id] = glyph;
    });
    //this.atlas = layout.atlas;
    //this.metrics = layout.metrics;
  }

  public getGlyph(code: number): GlyphData | undefined {
    return this.glyphs[code];
  }
}
