interface AtlasInfo {
  distanceRange: number;
  distanceRangeMiddle: number;
  size: number;
  width: number;
  height: number;
  yOrigin: "bottom" | "top";
}

interface Metrics {
  emSize: number;
  lineHeight: number;
  ascender: number;
  descender: number;
  underlineY: number;
  underlineThickness: number;
}

interface MSDFFontLayout {
  atlas: AtlasInfo;
  metrics: Metrics;
  glyphs: Array<
    {
      unicode: number;
    } & GlyphData
  >;
}

interface GlyphData {
  advance: number;
  planeBounds?: {
    left: number;
    bottom: number;
    right: number;
    top: number;
  };
  atlasBounds?: {
    left: number;
    bottom: number;
    right: number;
    top: number;
  };
}

export default class MSDFFont {
  private glyphs: Record<number, GlyphData>;
  public atlasTextureId: string;
  public atlas: AtlasInfo;
  public metrics: Metrics;

  constructor(atlasTextureId: string, layout: MSDFFontLayout) {
    this.atlasTextureId = atlasTextureId;
    this.glyphs = {};
    layout.glyphs.forEach((glyph) => {
      this.glyphs[glyph.unicode] = glyph;
    });
    this.atlas = layout.atlas;
    this.metrics = layout.metrics;
  }

  public getGlyph(code: number): GlyphData | undefined {
    return this.glyphs[code];
  }
}
