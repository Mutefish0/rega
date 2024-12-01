import { fetchBufferData } from "./utils";
import TextureManager from "./texture_manager";
import BMPFont from "../font/BMPFont";
import TFFont, { TypefaceData } from "../font/TFFont";
import MSDFFontObj, { MSDFFontData } from "../font/MSDFFont";

type FontType = "bitmap" | "typeface" | "msdf";

interface BitmapFont {
  type: "bitmap";
  fontObject: BMPFont;
}

interface TypefaceFont {
  type: "typeface";
  fontObject: TFFont;
}

interface MSDFFont {
  type: "msdf";
  fontObject: MSDFFontObj;
}

type FontWeight = "normal" | "bold" | "lighter";
type FontStyle = "normal" | "italic";

type Font = BitmapFont | TypefaceFont | MSDFFont;

export default class FontManager {
  static fonts = new Map<string, Font>();
  public static async add<T extends FontType>(
    fontFamily: string,
    opts: T extends "bitmap"
      ? {
          type: T;
          url: string;
          stepSize: [number, number];
          charSize: [number, number];
          fontWeight?: FontWeight;
          fontStyle?: FontStyle;
        }
      : T extends "msdf"
      ? { type: T; url: string; fontWeight?: FontWeight }
      : { type: T; url: string }
  ) {
    if (opts.type === "bitmap") {
      await TextureManager.add(opts.url);
      const key = `${fontFamily}-${opts.fontWeight || "normal"}-${
        opts.fontStyle || "normal"
      }`;
      this.fonts.set(key, {
        type: opts.type,
        fontObject: new BMPFont(opts.url, opts.stepSize, opts.charSize),
      });
    } else if (opts.type === "typeface") {
      const fontData = await fetchBufferData(opts.url);
      if (fontData.contentType === "application/json") {
        const data = JSON.parse(
          new TextDecoder().decode(fontData.buffer)
        ) as TypefaceData;
        const { cssFontWeight, cssFontStyle } = data;
        const key = `${fontFamily}-${cssFontWeight}-${cssFontStyle}`;
        this.fonts.set(key, {
          type: opts.type,
          fontObject: new TFFont(data),
        });
      }
    } else if (opts.type === "msdf") {
      const configData = await fetchBufferData(opts.url);
      if (configData.contentType === "application/json") {
        const config = JSON.parse(
          new TextDecoder().decode(configData.buffer)
        ) as MSDFFontData;
        const { pages } = config;
        const atlases = pages.map((page) => opts.url.replace(/[^/]+$/, page));
        await Promise.all(atlases.map((atlas) => TextureManager.add(atlas)));
        const key = `${fontFamily}-${opts.fontWeight || "normal"}-normal`;
        this.fonts.set(key, {
          type: opts.type,
          fontObject: new MSDFFontObj(atlases, config),
        });
      }
    }
  }

  public static get(
    fontFamily: string,
    fontWeight: FontWeight = "normal",
    fontStyle: FontStyle = "normal"
  ) {
    const key = `${fontFamily}-${fontWeight}-${fontStyle}`;
    return this.fonts.get(key);
  }
}
