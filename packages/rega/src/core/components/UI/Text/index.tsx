import { useMemo, ReactElement } from "react";
import FontManager from "../../../common/font_manager";
import SpriteText from "./SpriteText";
import TypefaceText from "./TypefaceText";
import MSDFBMText from "./MSDFBMText";
import MSDFText from "./MSDFText";
import { FlexStyle } from "../../YogaFlex/FlexStyle";
import type { TextChildren } from "./BaseText";

export interface TextStyle extends FlexStyle {
  fontFamily: string;
  fontWeight?: "normal" | "bold" | "lighter";
  fontStyle?: "normal" | "italic";
  fontSize: number;
  lineHeight?: number;
  color?: string;
  letterSpacing?: number;
  backgroundColor?: string;
  textAlign?: "start" | "end" | "center";
}

interface TextProps {
  children: TextChildren;
  style: TextStyle;
}

export default function Text(props: TextProps) {
  const font = useMemo(
    () =>
      FontManager.get(
        props.style.fontFamily,
        props.style.fontWeight,
        props.style.fontStyle
      ),
    [props.style.fontFamily]
  );

  if (font) {
    if (font.type === "bitmap") {
      return <SpriteText font={font.fontObject} {...props} />;
    } else if (font.type === "typeface") {
      return <TypefaceText font={font.fontObject} {...props} />;
    } else if (font.type === "msdf-bmfont") {
      return <MSDFBMText font={font.fontObject} {...props} />;
    } else if (font.type === "msdf") {
      return <MSDFText font={font.fontObject} {...props} />;
    }
  }

  return null;
}
