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

export interface MSDFFontConfig {
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

  public pxRange: number;
  public atlasYOrigin: "bottom" | "top";
  public atlasHeight: number;
  public atlasWidth: number;

  public lineHeight: number;
  public ascender: number;
  public descender: number;

  constructor(atlasTextureId: string, config: MSDFFontConfig) {
    this.atlasTextureId = atlasTextureId;
    this.glyphs = {};

    config.glyphs.forEach((glyph) => {
      this.glyphs[glyph.unicode] = glyph;
    });

    const { ascender, descender, lineHeight } = config.metrics;

    this.atlasYOrigin = config.atlas.yOrigin;
    this.pxRange = config.atlas.distanceRange;
    this.atlasHeight = config.atlas.height;
    this.atlasWidth = config.atlas.width;
    this.lineHeight = lineHeight;
    this.ascender = ascender;
    this.descender = descender;
  }

  public getGlyph(code: number): GlyphData | undefined {
    return this.glyphs[code];
  }
}
