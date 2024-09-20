import { useMemo } from "react";
import FontManager from "../../common/font_manager";
import SpriteText from "./SpriteText";
import TypefaceText from "./TypefaceText";
import { FlexStyle } from "../YogaFlex/FlexStyle";

export interface TextStyle extends FlexStyle {
  fontFamily: string;
  fontWeight?: "normal" | "bold" | "lighter";
  fontStyle?: "normal" | "italic";
  fontSize: number;
  lineHeight?: number;
  color?: string;
  letterSpacing?: number;
  backgroundColor?: string;
}

interface TextProps {
  children: string;
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
    }
  }

  return null;
}
