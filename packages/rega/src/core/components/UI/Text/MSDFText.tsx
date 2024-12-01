import React, { useContext, useMemo, useCallback } from "react";
import BaseText, { ceil } from "./BaseText";
import SpriteMSDF from "../../SpriteMSDF";
import BlockContext from "../BlockContext";
import { TextStyle } from "./index";
import MSDFFont from "../../../font/MSDFFont";

interface SpriteTextProps {
  font: MSDFFont;
  children: string | number | Array<string | number>;
  style: TextStyle;
}

export default function SpriteText({ font, children, style }: SpriteTextProps) {
  const { color = "white", fontSize } = style;

  const blockContext = useContext(BlockContext);

  const scale = fontSize / font.fontSize;

  const ha = useCallback(
    (code: number) => {
      const glyph = font.getGlyph(code);
      return glyph ? glyph.xadvance * scale : 0;
    },
    [fontSize]
  );

  return (
    <BaseText
      verticalLayoutMethod="top"
      ha={ha}
      style={style}
      renderItem={(code) => {
        const glyph = font.getGlyph(code);

        if (!glyph) {
          return null;
        }

        const atlas = font.pages[glyph.page];

        if (!atlas) {
          return null;
        }

        const { x, y, width, height } = glyph;

        const aspectRatio = width / height;
        const charWidth = ceil(fontSize * aspectRatio);

        return (
          <SpriteMSDF
            color={color}
            key={code}
            anchor="top-left"
            clip={[x, y, width, height]}
            atlasTextureId={atlas}
            size={[charWidth, style.fontSize]}
          />
        );
      }}
    >
      {children}
    </BaseText>
  );
}
