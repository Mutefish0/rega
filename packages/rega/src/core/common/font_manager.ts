import { fetchBufferData } from "./utils";
import TextureManager from "./texture_manager";
import BMPFont from "../font/BMPFont";
import TFFont, { TypefaceData } from "../font/TFFont";

type FontType = "bitmap" | "typeface";

interface BitmapFont {
  type: "bitmap";
  fontObject: BMPFont;
}

interface TypefaceFont {
  type: "typeface";
  fontObject: TFFont;
}

type FontWeight = "normal" | "bold" | "lighter";
type FontStyle = "normal" | "italic";

type Font = BitmapFont | TypefaceFont;

export default class FontManager {
  static fonts = new Map<string, Font>();
  public static async add<T extends FontType>(
    fontFamily: string,
    opts: T extends "bitmap"
      ? {
          type: T;
          url: string;
          charSize: [number, number];
          fontWeight?: FontWeight;
          fontStyle?: FontStyle;
        }
      : { type: T; url: string }
  ) {
    if (opts.type === "bitmap") {
      await TextureManager.add(opts.url);
      const key = `${fontFamily}-${opts.fontWeight || "normal"}-${
        opts.fontStyle || "normal"
      }`;
      this.fonts.set(key, {
        type: opts.type,
        fontObject: new BMPFont(opts.url, opts.charSize),
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
